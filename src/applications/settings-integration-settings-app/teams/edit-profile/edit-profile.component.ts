import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
    KalturaClient,
    KalturaFilterPager,
    KalturaNullableBoolean,
    KalturaUser,
    KalturaUserFilter,
    KalturaUserType,
    UserListAction,
    KalturaESearchUserResult,
    ESearchSearchUserAction,
    KalturaESearchUserParams,
    KalturaESearchUserOperator,
    KalturaESearchOperatorType,
    KalturaESearchUserItem,
    KalturaESearchItemType,
    KalturaESearchUserFieldName
} from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { cancelOnDestroy } from "@kaltura-ng/kaltura-common";
import { Subject } from "rxjs";
import { SuggestionsProviderData } from "@kaltura-ng/kaltura-primeng-ui";
import { ISubscription } from "rxjs/Subscription";
import { Observable } from "rxjs";
import { CategoriesSearchService } from "app-shared/content-shared/categories/categories-search.service";
import { BrowserService } from "app-shared/kmc-shell";
import { TeamsIntegration } from '../teams.service';

@Component({
    selector: 'kTeamsEditProfile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    providers: [CategoriesSearchService, KalturaLogger.createLogger('EditTeamsProfileComponent')]
})
export class EditTeamsProfileComponent implements OnDestroy {
    @Input() parentPopup: PopupWidgetComponent;
    @Input() set profile(value: TeamsIntegration | null) {
        if (value) {
            this._profile = value;
            this._buildForm();
            this._setInitialValue(this._profile);
        }
    }

    @Output() onSave = new EventEmitter<TeamsIntegration>();

    public _profileForm: FormGroup;
    public _profile: TeamsIntegration;

    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    private _searchCategoriesSubscription: ISubscription;
    public _usersProvider = new Subject<SuggestionsProviderData>();
    public _groupsProvider = new Subject<SuggestionsProviderData>();

    public _participationOptions: Array<{ value: number, label: string }>;
    public _hostsOptions: Array<{ value: number, label: string }>;

    private _searchUsersSubscription: ISubscription;
    private _searchGroupsSubscription: ISubscription;
    private groupsDelimiter: string = String.fromCharCode(13)+String.fromCharCode(10); // \r\n

    constructor(private _appLocalization: AppLocalization,
                private _fb: FormBuilder,
                private _browserService: BrowserService,
                private _kalturaServerClient: KalturaClient,
                private _categoriesSearchService: CategoriesSearchService,
                private _logger: KalturaLogger) {
        this._participationOptions = [
            {value: 0, label: this._appLocalization.get('applications.settings.integrationSettings.teams.users1')},
            {value: 1, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts3')},
            {value: 3, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts4')}
        ];
        this._hostsOptions = [
            {value: 0, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts1')},
            {value: 1, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts3')},
            {value: 2, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts2')},
            {value: 3, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts4')},
            {value: 4, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts5')}
        ];
    }

    ngOnDestroy() {
        this._categoriesProvider.complete();
        this._usersProvider.complete();
        this._groupsProvider.complete();
    }

    private getRole(roles: ('co-editors' | 'co-publishers' | 'co-viewers')[]): number {
        let role = 0;
        if (roles.indexOf('co-publishers') > -1) {
            role = 1;
        }
        if (roles.indexOf('co-viewers') > -1) {
            role = 2;
        }
        if (roles.indexOf('co-editors') > -1) {
            role = 3;
        }
        if (roles.indexOf('co-editors') > -1 && roles.indexOf('co-publishers') > -1) {
            role = 4;
        }
        return  role;
    }

    private getRolesById(id: number): string[] {
        let roles = [];
        if (id === 1) {
            roles = ['co-publishers'];
        }
        if (id ===2) {
            roles = ['co-viewers'];
        }
        if (id ===3) {
            roles = ['co-editors'];
        }
        if (id ===4) {
            roles = ['co-editors', 'co-publishers'];
        }
        return  roles;
    }

    private _setInitialValue(profile: TeamsIntegration): void {
        let optInGroupNames = [];
        if (this._profile.settings?.userGroupsInclude?.length) {
            this._profile.settings.userGroupsInclude.forEach(groupName => optInGroupNames.push({id: groupName}));
        }
        let optOutGroupNames = [];
        if (this._profile.settings?.userGroupsExclude?.length) {
            this._profile.settings.userGroupsExclude.forEach(groupName => optOutGroupNames.push({id: groupName}));
        }
        this._profileForm.setValue({
            name: this._profile.name,
            tenantId: this._profile.tenantId,
            appClientId: this._profile.appClientId,
            categories: this._profile.settings?.categories || [],
            upload: this._profile.settings?.userGroupsInclude?.length ? 1 : this._profile.settings?.userGroupsExclude?.length ? 2 : 0,
            uploadIn: optInGroupNames,
            uploadOut: optOutGroupNames,
            transcripts: this._profile.settings?.uploadTranscripts ? true : false,
            coOrganizerRoles: this.getRole(this._profile.settings?.coOrganizerRoles || []),
            presentersRoles: this.getRole(this._profile.settings?.presentersRoles || []),
            attendeesRoles: this.getRole(this._profile.settings?.attendeesRoles || []),
            userId: this._profile.settings?.userIdSource === 'upn' ? true : false,
            postfix: this._profile.settings?.userIdSuffixMethod === 'append' ? 2 : this._profile.settings?.userIdSuffixMethod === 'remove' ? 1 : 0,
            userPostfix: this._profile.settings?.userIdSuffix || '',
            createUser: this._profile.settings?.defaultUserId ? false : true,
            defaultUserId: this._profile.settings?.defaultUserId ? [{id: this._profile.settings?.defaultUserId}] : [],
        });

        this._profileForm.controls['tenantId'].disable();
        this._profileForm.controls['appClientId'].disable();
        if (this._profile.settings?.userNotFoundMethod === 'create') {
            this._profileForm.controls['defaultUserId'].disable();
        }

    }

    private _buildForm(): void {
        this._profileForm = this._fb.group({
            name: ['', Validators.required],
            tenantId: [''],
            appClientId: [''],
            categories: [[]],
            upload: [0],
            uploadIn: [[]],
            uploadOut: [[]],
            transcripts: true,
            coOrganizerRoles: null,
            presentersRoles: null,
            attendeesRoles: null,
            userId: true,
            postfix: 0,
            userPostfix: [''],
            createUser: true,
            defaultUserId: [''],
        });

        this._profileForm.controls['userId'].valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value === false) {
                    this._profileForm.controls['postfix'].disable();
                    this._profileForm.controls['userPostfix'].disable();
                } else {
                    this._profileForm.controls['postfix'].enable();
                    this._profileForm.controls['userPostfix'].enable();
                }
            });

        this._profileForm.controls['createUser'].valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value) {
                    this._profileForm.controls['defaultUserId'].disable();
                } else {
                    this._profileForm.controls['defaultUserId'].enable();
                }
            });
    }

    public openHelpLink(): void {
        this._browserService.openLink('https://marketplace.zoom.us/docs/api-reference/zoom-api/users/user');
    }

    public _save(): void {
        this._logger.info(`handle 'save' action by the user`);
        const formValue = this._profileForm.getRawValue();

        this._profile.name = formValue.name;
        this._profile.settings = {
            uploadRecordings: true,
            uploadTranscripts: formValue.transcripts,
            categories: formValue.categories
        }

        Object.assign(this._profile.settings, {userGroupsInclude: [], userGroupsExclude: []});
        if (formValue.upload === 1 && formValue.uploadIn.length) {
            Object.assign(this._profile.settings, {userGroupsInclude: formValue.uploadIn.map(user => user.id ? user.id : user)});
        }
        if (formValue.upload === 2 && formValue.uploadOut.length) {
            Object.assign(this._profile.settings, {userGroupsExclude: formValue.uploadOut.map(user => user.id ? user.id : user)});
        }

        Object.assign(this._profile.settings, {coOrganizerRoles: this.getRolesById(formValue.coOrganizerRoles)});
        Object.assign(this._profile.settings, {presentersRoles: this.getRolesById(formValue.presentersRoles)});
        Object.assign(this._profile.settings, {attendeesRoles: this.getRolesById(formValue.attendeesRoles)});

        const userIdSource = formValue.userId ? 'upn' : 'azure-id';
        Object.assign(this._profile.settings, {userIdSource});

        if (formValue.postfix > 0) {
            const userIdSuffixMethod = formValue.postfix === 1 ? 'remove' : 'append';
            Object.assign(this._profile.settings, {userIdSuffixMethod});
        }

        if (formValue.userPostfix?.length) {
            Object.assign(this._profile.settings, {userIdSuffix: formValue.userPostfix});
        }

        const userNotFoundMethod = formValue.createUser ? 'create' : 'assign-default';
        Object.assign(this._profile.settings, {userNotFoundMethod});

        if (formValue.defaultUserId?.length) {
            Object.assign(this._profile.settings, {defaultUserId: formValue.defaultUserId[0].id});
        }

        this.onSave.emit(this._profile);
        this.parentPopup.close();
    }

    /* ---------------------------- categories auto complete code starts ------------------------- */

    public _searchCategories(event): void {
        this._categoriesProvider.next({suggestions: [], isLoading: true});
        if (this._searchCategoriesSubscription) {
            // abort previous request
            this._searchCategoriesSubscription.unsubscribe();
            this._searchCategoriesSubscription = null;
        }
        this._searchCategoriesSubscription = this.searchCategories(event.query).subscribe(data => {
                const suggestions = [];
                const profileCategories = this._profile.settings?.categories && this._profile.settings?.categories.length ? this._profile.settings.categories : [];
                (data || []).forEach(suggestedCategory => {
                    const label = suggestedCategory.fullName + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');
                    const isSelectable = !profileCategories.find(category => {
                        return category === suggestedCategory.fullName;
                    });
                    suggestions.push({name: label, isSelectable: isSelectable, item: suggestedCategory});
                });
                this._categoriesProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._categoriesProvider.next({
                    suggestions: [],
                    isLoading: false,
                    errorMessage: <any>(err.message || err)
                });
            });
    }

    private searchCategories(text: string) {
        return Observable.create(
            observer => {
                const requestSubscription = this._categoriesSearchService.getSuggestions(text)
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        result => {
                            observer.next(result);
                            observer.complete();
                        },
                        err => {
                            observer.error(err);
                        }
                    );
                return () => {
                    console.log("zoom profile edit: searchCategories(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

    public _categoriesTooltipResolver = (value: any) => {
        return value.name;
    };

    /* ---------------------------- categories auto complete code ends ------------------------- */

    /* ---------------------------- groups auto complete code starts ------------------------- */

    public _searchGroups(event, options: string): void {
        this._logger.info(`handle search groups action`, { query: event.query });
        this._groupsProvider.next({suggestions: [], isLoading: true});

        if (this._searchGroupsSubscription) {
            // abort previous request
            this._searchGroupsSubscription.unsubscribe();
            this._searchGroupsSubscription = null;
        }

        this._searchGroupsSubscription = this._kalturaServerClient.request(
            new UserListAction(
                {
                    filter: new KalturaUserFilter({
                        typeEqual: KalturaUserType.group,
                        idOrScreenNameStartsWith: event.query.split(" ").join("_")
                    }),
                    pager: new KalturaFilterPager({
                        pageIndex: 0,
                        pageSize: 30
                    })
                }
            )
        )
            .pipe(cancelOnDestroy(this))
            .subscribe(
                data => {
                    this._logger.info(`handle successful search groups action`);
                    const suggestions = [];

                    const profileGroups = options === 'optIn' ? this._profileForm.get('uploadIn').value : this._profileForm.get('uploadOut').value;
                    (data.objects || []).forEach((suggestedUser: KalturaUser) => {
                        const isSelectable = !profileGroups.find(group => {
                            return group.id === suggestedUser.id;
                        });
                        suggestions.push({
                            name: suggestedUser.id === suggestedUser.screenName ? suggestedUser.id : `${suggestedUser.id} (${suggestedUser.screenName})`,
                            item: suggestedUser,
                            isSelectable
                        });
                    });
                    this._groupsProvider.next({suggestions: suggestions, isLoading: false});
                },
                err => {
                    this._logger.warn(`handle successful search users action`, { errorMessage: err.message });
                    this._groupsProvider.next({suggestions: [], isLoading: false, errorMessage: <any>(err.message || err)});
                }
            );
    }

    public _groupsTooltipResolver = (value: any) => {
        return value.id;
    };

    /* ---------------------------- groups auto complete code ends ------------------------- */


    /* ---------------------------- users auto complete code start ------------------------- */

    public _searchUsers(event): void {
        this._logger.info(`handle search users action`, { query: event.query });
        this._usersProvider.next({suggestions: [], isLoading: true});

        if (this._searchUsersSubscription) {
            // abort previous request
            this._searchUsersSubscription.unsubscribe();
            this._searchUsersSubscription = null;
        }

        this._searchUsersSubscription = this._kalturaServerClient.request(
            new ESearchSearchUserAction({
                searchParams: new KalturaESearchUserParams({
                    searchOperator: new KalturaESearchUserOperator({
                        operator: KalturaESearchOperatorType.orOp,
                        searchItems: [
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.startsWith,
                                fieldName: KalturaESearchUserFieldName.screenName,
                                searchTerm: event.query
                            }),
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.startsWith,
                                fieldName: KalturaESearchUserFieldName.firstName,
                                searchTerm: event.query.split(" ")[0]
                            }),
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.partial,
                                fieldName: KalturaESearchUserFieldName.lastName,
                                searchTerm: event.query
                            }),
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.startsWith,
                                fieldName: KalturaESearchUserFieldName.userId,
                                searchTerm: event.query
                            })
                        ]
                    })
                }),
                pager: new KalturaFilterPager({
                    pageIndex : 0,
                    pageSize : 30
                })
            })
        )
            .pipe(cancelOnDestroy(this))
            .subscribe(
                data => {
                    this._logger.info(`handle successful search users action`);
                    const suggestions = [];
                    let users = [];
                    if (data?.objects) {
                        data.objects.forEach((res: KalturaESearchUserResult) => users.push(res.object))
                    }
                    (users).forEach((suggestedUser: KalturaUser) => {
                        suggestions.push({
                            name: suggestedUser.screenName + '(' + suggestedUser.id + ')',
                            item: suggestedUser,
                            isSelectable: true
                        });
                    });
                    this._usersProvider.next({suggestions: suggestions, isLoading: false});
                },
                err => {
                    this._logger.warn(`handle successful search users action`, { errorMessage: err.message });
                    this._usersProvider.next({suggestions: [], isLoading: false, errorMessage: <any>(err.message || err)});
                }
            );
    }

    public _usersTooltipResolver = (value: any) => {
        return value.screenName;
    };

    /* ---------------------------- users auto complete code ends ------------------------- */


}

