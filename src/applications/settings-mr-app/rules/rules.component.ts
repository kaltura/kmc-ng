import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ManagedTasksProfile, LoadManagedTasksProfilesResponse, SortDirection, MrStoreService } from '../mr-store/mr-store.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppAnalytics, BrowserService } from 'app-shared/kmc-shell/providers';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsMrMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from "app-shared/kmc-shared/columns-resize-manager";
import { Menu } from "primeng/menu";
import { MenuItem } from "primeng/api";
import {Router} from '@angular/router';

@Component({
    selector: 'kMrRules',
    templateUrl: './rules.component.html',
    styleUrls: ['./rules.component.scss'],
    providers: [KalturaLogger.createLogger('MrRulesComponent'),
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'rules-table' }
    ]
})

export class RulesComponent implements OnInit, OnDestroy {
    @ViewChild('newPopup', { static: true }) public newPopup: PopupWidgetComponent;
    @ViewChild('deletePopup', { static: true }) public deletePopup: PopupWidgetComponent;
    @ViewChild('actionsmenu', { static: true }) private _actionsMenu: Menu;

    public _isBusy = false;
    public _profiles: ManagedTasksProfile[] = [];
    public _profilesCount = 0;
    public _currentEditProfile: ManagedTasksProfile = null;
    public _blockerMessage: AreaBlockerMessage = null;
    public pageSize = 25;
    public pageIndex = 0;
    public sortField = 'createdAt';
    public sortOrder = SortDirection.Desc;
    public _rowTrackBy: Function = (index: number, item: any) => item.id;
    public _items: MenuItem[];

    constructor(private _mrStore: MrStoreService,
                private _logger: KalturaLogger,
                private _router: Router,
                private _browserService: BrowserService,
                private _mrMainViewService: SettingsMrMainViewService,
                public _columnsResizeManager: ColumnsResizeManagerService,
                private _appLocalization: AppLocalization,
                private _analytics: AppAnalytics) {
    }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            this._loadProfiles(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
        }
    }

    ngOnDestroy() {
    }

    public _loadProfiles(pageSize: number, pageIndex: number, sortField: string, sortOrder: number): void {
        this._blockerMessage = null;
        this._isBusy = true;
        this._mrStore.loadProfiles(pageSize, pageIndex, sortField, sortOrder).subscribe(
            (response: LoadManagedTasksProfilesResponse) => {
                this._isBusy = false;
                if (response.objects?.length) {
                    this._profiles = response.objects as ManagedTasksProfile[];
                    this._profiles.forEach(profile => { // mapping
                        profile.createdAt = new Date(profile.createdAt);
                        profile.updatedAt = new Date(profile.updatedAt);
                    });
                    this._mrStore.rulesIds = this._profiles.map(profile => profile.id);
                }
                this._profilesCount = response.totalCount;
            },
            error => {
                this._isBusy = false;
                this._blockerMessage = new AreaBlockerMessage({
                    message: this._appLocalization.get('applications.settings.mr.rulesLoadError'),
                    buttons: [
                        {
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => {
                                this._logger.info(`user confirmed, retry action`);
                                this._blockerMessage = null;
                                this._refresh();
                            }
                        },
                        {
                            label: this._appLocalization.get('app.common.cancel'),
                            action: () => {
                                this._logger.info(`user didn't confirm, abort action, dismiss dialog`);
                                this._blockerMessage = null;
                            }
                        }
                    ]
                });
            }
        )
    }

    public _refresh(): void {
        this._loadProfiles(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
    }

    private _buildMenu(profile: ManagedTasksProfile): void {
        this._items = [
            {
                id: 'enable-disable',
                label: profile.status === 'enabled' ? this._appLocalization.get('applications.settings.mr.disable') : this._appLocalization.get('applications.settings.mr.enable'),
                command: () => this._actionSelected('enable-disable', profile)
            },
            // {
            //     id: 'test-run',
            //     label: this._appLocalization.get('applications.settings.mr.testRun'),
            //     command: () => this._actionSelected('test-run', profile)
            // },
            {
                id: 'edit',
                label: this._appLocalization.get('applications.settings.authentication.table.edit'),
                command: () => this._actionSelected('edit', profile)
            },
            {
                id: 'delete',
                label: this._appLocalization.get('applications.settings.authentication.table.delete'),
                styleClass: 'kDanger',
                command: () => this._actionSelected('delete', profile)
            }
        ];
    }

    private _actionSelected(action: string, profile: ManagedTasksProfile): void {
        switch (action) {
            case "enable-disable":
                this.toggleStatus(profile);
                break;
            case "edit":
                this._editProfile(profile);
                break;
            case "delete":
                this.deletePopup.open();
                break;
        }
    }

    private toggleStatus(profile: ManagedTasksProfile): void {
        // prevent enabling profile wi no criteria
        if (profile.status === 'disabled' && (typeof profile.objectFilter === "undefined" || Object.keys(profile.objectFilter).length === 0)) {
            this._browserService.alert(
                {
                    header: this._appLocalization.get('applications.settings.mr.noCriteriaHeader'),
                    message: this._appLocalization.get('applications.settings.mr.cannotEnable')
                }
            );
        } else {
            this._currentEditProfile.status = profile.status === 'enabled' ? 'disabled' : 'enabled';
            this.updateProfile(this._currentEditProfile);
        }
    }

    public _openActionsMenu(event: any, profile: ManagedTasksProfile): void {
        if (this._actionsMenu) {
            this._currentEditProfile = profile;
            this._buildMenu(profile);
            this._actionsMenu.toggle(event);
        }
    }

    public _addProfile(): void {
        this._analytics.trackClickEvent('Add_ManagedTasksProfile');
        this._logger.info(`handle add ManagedTasksProfile action by user`);
        this._currentEditProfile = null;
        this.newPopup.open();
    }

    public _editProfile(profile: ManagedTasksProfile): void {
        this._currentEditProfile = profile;
        this._analytics.trackClickEvent('Edit_ManagedTasksProfile');
        this._logger.info(`handle edit ManagedTasksProfile action by user`);
        this._mrStore.selectedRule = profile;
        this._router.navigateByUrl(`/settings/mr/rule/${profile.id}`);
    }

    private displayError(error: string): void {
        this._isBusy = false;
        this._blockerMessage = new AreaBlockerMessage({
            message: error?.length ? error : this._appLocalization.get('applications.settings.mr.deleteError'),
            buttons: [
                {
                    label: this._appLocalization.get('app.common.close'),
                    action: () => {
                        this._blockerMessage = null;
                    }
                }
            ]
        });
    }

    public deleteProfile(): void {
        this._blockerMessage = null;
        this._isBusy = true;
        this._mrStore.deleteProfile(this._currentEditProfile.id).subscribe(
            (response) => {
                if (response && response.objectType && response.objectType === "KalturaAPIException") {
                    // error returned from the server in the response
                    this.displayError(response.message ? response.message : '');
                } else {
                    // success
                    this._currentEditProfile = null;
                    this.pageIndex = 0;
                    this._refresh();
                }
            },
            error => {
                this.displayError('');
            }
        )
    }

    private updateProfile(profile: ManagedTasksProfile): void {
        this._blockerMessage = null;
        this._isBusy = true;
        delete profile.partnerId;
        // fix advancedCadence
        if (profile.runningCadence.advancedCadence.dateUnit === 'day') {
            delete profile.runningCadence.advancedCadence.day;
            delete profile.runningCadence.advancedCadence.dayNumber;
        }
        if (profile.runningCadence.advancedCadence.dateUnit === 'week') {
            delete profile.runningCadence.advancedCadence.dayNumber;
        }
        if (profile.runningCadence.advancedCadence.dateUnit === 'month') {
            delete profile.runningCadence.advancedCadence.day;
        }
        // remove empty objectsFilter
        if (Object.keys(profile.objectFilter).length === 0) {
            profile.objectFilter = {};
            profile.objectFilterType = '';
        }
        this._mrStore.updateProfile(profile).subscribe(
            (response) => {
                if (response && response.objectType && response.objectType === "KalturaAPIException") {
                    // error returned from the server in the response
                    this.displayError(response.message ? response.message : this._appLocalization.get('applications.settings.mr.saveError'));
                } else {
                    // success
                    this._refresh();
                }
            },
            error => {
                this.displayError(this._appLocalization.get('applications.settings.mr.saveError'));
            }
        )
    }

    public onProfileCreated(profile: ManagedTasksProfile): void {
        this._editProfile(profile);
    }

    public _onPaginationChanged(state: any): void {
        if (state.page !== this.pageIndex || state.rows !== this.pageSize) {
            this.pageSize = state.rows;
            this.pageIndex = state.page;
            this._refresh();
        }
    }

    public onSortChanged(event): void {
        if (event.field !== this.sortField || event.order !== this.sortOrder) {
            this.sortField = event.field;
            this.sortOrder = event.order;
            this._refresh();
        }
    }


}
