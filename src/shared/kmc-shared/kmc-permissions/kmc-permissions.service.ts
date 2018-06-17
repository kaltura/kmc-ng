import { Injectable } from '@angular/core';
import { AppPermissionsServiceBase } from '@kaltura-ng/mc-shared';
import { KMCPermissions } from './kmc-permissions';
import { KMCPermissionsRules } from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions-rules';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Injectable()
export class KMCPermissionsService extends AppPermissionsServiceBase<KMCPermissions> {
    private _logger: KalturaLogger;
    private _restrictionsApplied = false;
    private _customPermissionNameToKeyMapping: { [name: string]: number} = {};
    get restrictionsApplied(): boolean {
        return this._restrictionsApplied;
    }

    constructor(logger: KalturaLogger) {
        super();
        this._logger = logger.subLogger('KMCPermissionsService');

        Object.keys(KMCPermissionsRules.customPermissionKeyToNameMapping).forEach((key) => {
            const customName = KMCPermissionsRules.customPermissionKeyToNameMapping[key] as any; // bypass typescript issue with implicit type checking
            this._customPermissionNameToKeyMapping[customName] = (<any>key);
        });
    }

    public getPermissionKeyByName(name: string): KMCPermissions {
        const customPermissionKey = this._customPermissionNameToKeyMapping[name];
        return customPermissionKey ? customPermissionKey : KMCPermissions[name];
    }

    public getPermissionNameByKey(key: KMCPermissions): string {
        const customPermissionName = KMCPermissionsRules.customPermissionKeyToNameMapping[key];
        return customPermissionName ? customPermissionName : KMCPermissions[key];
    }

    public getLinkedPermissionByKey(key: KMCPermissions): KMCPermissions {
        return KMCPermissionsRules.linkedPermissionMapping[key];
    }

    load(rawRolePermissionList: string[], rawPartnerPermissionList: string[]): void {

        super.flushPermissions();

        this._logger.info(`prepare user permissions set based on role permissions and partner permissions`);
        this._logger.trace('load()', () => ({
            rawRolePermissionList,
            rawPartnerPermissionList
        }));

        const rolePermissionList: Set<KMCPermissions> = new Set();
        const partnerPermissionList: Set<KMCPermissions> = new Set();
        const filteredRolePermissionList: Set<KMCPermissions> = new Set<KMCPermissions>();
        const linkedPermissionList: Set<KMCPermissions> = new Set<KMCPermissions>();
        let restrictionsApplied = false;

        const ignoredPartnerPermissionList: string[] = [];
        const ignoredRolePermissionList: string[] = [];

        // convert partner permission server value into app value
        rawPartnerPermissionList.forEach(rawPermission => {
            const permissionValue = this.getPermissionKeyByName(rawPermission);

            if (typeof permissionValue === 'undefined') {
                // ignoring partner permission since it is not in use by this app
                ignoredPartnerPermissionList.push(rawPermission);
            } else {
                partnerPermissionList.add(permissionValue);
            }
        });

        if (ignoredPartnerPermissionList.length) {
            this._logger.trace(`ignoring some partner permissions since they are not in use by this app.`,
                () => ({
                    permissions: ignoredPartnerPermissionList.join(',')
                }));
        }

        // convert role permission server value into app value
        rawRolePermissionList.forEach(rawPermission => {
            const permissionValue = this.getPermissionKeyByName(rawPermission)

            if (typeof permissionValue === 'undefined') {
                // ignoring role permission since it is not in use by this app
                ignoredRolePermissionList.push(rawPermission);
            } else {
                rolePermissionList.add(permissionValue);
            }
        });

        if (ignoredRolePermissionList.length) {
            this._logger.trace(`ignoring some role permissions since they are not in use by this app`, () => ({
                permissions: ignoredRolePermissionList.join(',')
            }));
        }

        // traverse on each role permission and add it to user permissions set if possible
        rolePermissionList.forEach(permission => {
            const requiredPermission = KMCPermissionsRules.requiredPermissionMapping[permission];
            const linkedPermission = KMCPermissionsRules.linkedPermissionMapping[permission];

            if (requiredPermission && !partnerPermissionList.has(requiredPermission)) {
                this._logger.info(`removing role permission '${KMCPermissions[permission]}' since a partner permission '${KMCPermissions[requiredPermission]}' is not available`);
                restrictionsApplied = true;
            } else {
                if (linkedPermission) {
                    // add the linked permission to a temporary storage
                    linkedPermissionList.add(linkedPermission);
                }

                // add the permission to the user permissions set
                filteredRolePermissionList.add(permission);
            }
        });

        // traverse on linked permissions and add to user permissions set if possible
        linkedPermissionList.forEach(linkedPermission => {

            if (!filteredRolePermissionList.has(linkedPermission)) {
                const requiredPermission = KMCPermissionsRules.requiredPermissionMapping[linkedPermission];

                if (!requiredPermission ||
                    (requiredPermission && partnerPermissionList.has(requiredPermission))) {
                    this._logger.info(`adding linked role permission '${KMCPermissions[linkedPermission]}'`);
                    filteredRolePermissionList.add(linkedPermission);
                }
            }
        });

        // Checking if can remove this loop since it appears that userRole/get returns them as well
        partnerPermissionList.forEach(permission => {
            filteredRolePermissionList.add(permission);
        });

        const userPermissions = Array.from(filteredRolePermissionList);
        super.loadPermissions(userPermissions);

        this._logger.info(`setting flag restrictionsApplied with value '${restrictionsApplied}'`);
        this._restrictionsApplied = restrictionsApplied;
    }

    isPermissionEnabled(permission: KMCPermissions): boolean {
        const requiredPermission = KMCPermissionsRules.requiredPermissionMapping[permission];
        return !requiredPermission || ((requiredPermission) && super.hasPermission(requiredPermission));
    }
}
