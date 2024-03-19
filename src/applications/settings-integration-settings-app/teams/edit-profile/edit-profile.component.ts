import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
        }
    }

    @Output() onSave = new EventEmitter<TeamsIntegration>();

    public _profileForm: FormGroup;
    public formValid = true;

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
            {value: 2, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.participation1')},
            {value: 1, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.participation2')},
            {value: 0, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.participation3')}
        ];
        this._hostsOptions = [
            {value: 2, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts1')},
            {value: 1, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts2')},
            {value: 0, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts3')},
            {value: 3, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts4')},
            {value: 4, label: this._appLocalization.get('applications.settings.integrationSettings.zoom.hosts5')}
        ];
    }

    ngOnDestroy() {
        this._categoriesProvider.complete();
        this._usersProvider.complete();
        this._groupsProvider.complete();
    }

    private _setInitialValue(profile: TeamsIntegration): void {
        let optInGroupNames = [];
        /*
        if (profile.optInGroupNames) {
            profile.optInGroupNames.split(this.groupsDelimiter).forEach(groupName => optInGroupNames.push({id: groupName}));
        }
        let optOutGroupNames = [];
        if (profile.optOutGroupNames) {
            profile.optOutGroupNames.split(this.groupsDelimiter).forEach(groupName => optOutGroupNames.push({id: groupName}));
        }
        this._profileForm.setValue({
            enabled: profile.enableRecordingUpload === KalturaNullableBoolean.trueValue,
            accountId: profile.accountId || '',
            defaultUserId: profile.defaultUserId ? [{screenName: profile.defaultUserId}] : [],
            uploadIn: optInGroupNames,
            uploadOut: optOutGroupNames,
            description: profile.zoomAccountDescription || '',
            deleteContent: profile.deletionPolicy === KalturaNullableBoolean.trueValue,
            transcription: profile.enableZoomTranscription === KalturaNullableBoolean.trueValue,
            userId: profile.zoomUserMatchingMode !== KalturaZoomUsersMatching.cmsMatching,
            createUser: profile.createUserIfNotExist === KalturaNullableBoolean.trueValue,
            postfix: profile.zoomUserMatchingMode,
            userPostfix: profile.zoomUserPostfix,
            participation: profile.handleParticipantsMode,
            altHosts: profile.handleAlternativeHostsMode,
            coHosts: profile.handleCohostsMode,
            upload: profile.groupParticipationType || 0,
            categories: profile.zoomCategory ? [{name: profile.zoomCategory}] : [],
            webinarCategory: profile.zoomWebinarCategory ? [{name: profile.zoomWebinarCategory}] : [],
            uploadMeeting: typeof profile.enableMeetingUpload === "undefined" || profile.enableMeetingUpload === KalturaNullableBoolean.trueValue,
            uploadWebinar: profile.enableWebinarUploads === KalturaNullableBoolean.trueValue
        });

         */
        this.validate();
    }

    private _buildForm(): void {
        this._profileForm = this._fb.group({
            name: [this._profile.name, Validators.required],
            tenantId: [this._profile.tenantId],
            appClientId: [this._profile.appClientId],
            appClientSecret: [this._profile.appClientSecret, Validators.required],
            categories: [this._profile.settings?.categoryIds || []],
            upload: [0],
            uploadIn: [[]],
            uploadOut: [[]],
            transcripts: true,
            // enabled: false,
            // accountId: [''],
            // defaultUserId: [[]],
            // uploadIn: [[]],
            // uploadOut: [[]],
            // description: [''],
            // deleteContent: false,
            // transcription: false,
            // createUser: false,
            // userId: false,
            // postfix: null,
            // userPostfix: [''],
            // participation: null,
            // altHosts: null,
            // coHosts: null,
            // upload: null,
            // categories: [[]],
            // webinarCategory: [[]],
            // uploadMeeting: false,
            // uploadWebinar: false
        });
        this._profileForm.controls['tenantId'].disable();
        this._profileForm.controls['appClientId'].disable();
/*
        this._recordingUpload = this._profileForm.controls['enabled'];
        this._accountId = this._profileForm.controls['accountId'];
        this._accountId.disable();
        this._defaultUserId = this._profileForm.controls['defaultUserId'];
        this._uploadIn = this._profileForm.controls['uploadIn'];
        this._uploadOut = this._profileForm.controls['uploadOut'];
        this._description = this._profileForm.controls['description'];
        this._deleteContent = this._profileForm.controls['deleteContent'];
        this._transcription = this._profileForm.controls['transcription'];
        this._userId = this._profileForm.controls['userId'];
        this._createUser = this._profileForm.controls['createUser'];
        this._postfix = this._profileForm.controls['postfix'];
        this._userPostfix = this._profileForm.controls['userPostfix'];
        this._participation = this._profileForm.controls['participation'];
        this._altHosts = this._profileForm.controls['altHosts'];
        this._coHosts = this._profileForm.controls['coHosts'];
        this._upload = this._profileForm.controls['upload'];
        this._categories = this._profileForm.controls['categories'];
        this._webinarCategory = this._profileForm.controls['webinarCategory'];
        this._uploadMeeting = this._profileForm.controls['uploadMeeting'];
        this._uploadWebinar = this._profileForm.controls['uploadWebinar'];
        if (!this._enableMeetingUpload) {
            this._uploadMeeting.disable();
        }

        this._recordingUpload.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value) {
                    this._description.enable();
                    this._deleteContent.enable();
                    this._transcription.enable();
                    this._userId.enable();
                    this._defaultUserId.enable();
                    this._uploadIn.enable();
                    this._uploadOut.enable();
                    this._createUser.enable();
                    this._postfix.enable();
                    this._userPostfix.enable();
                    this._participation.enable();
                    this._altHosts.enable();
                    this._coHosts.enable();
                    this._upload.enable();
                    this._categories.enable();
                    this._webinarCategory.enable();
                    if (this._enableMeetingUpload) {
                        this._uploadMeeting.enable();
                    }
                    this._uploadWebinar.enable();
                } else {
                    this._description.disable();
                    this._deleteContent.disable();
                    this._transcription.disable();
                    this._userId.disable();
                    this._createUser.disable();
                    this._postfix.disable();
                    this._userPostfix.disable();
                    this._participation.disable();
                    this._altHosts.disable();
                    this._coHosts.disable();
                    this._upload.disable();
                    this._categories.disable();
                    this._defaultUserId.disable();
                    this._uploadIn.disable();
                    this._uploadOut.disable();
                    this._webinarCategory.disable();
                    this._uploadMeeting.disable();
                    this._uploadWebinar.disable();
                }
            });
        this._userId.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value === false) {
                    this._postfix.disable();
                    this._userPostfix.disable();
                    this._profileForm.patchValue({
                        postfix: KalturaZoomUsersMatching.cmsMatching
                    });
                } else if (this._profileForm.controls['enabled'].value){
                    this._postfix.enable();
                    this._profileForm.patchValue({
                        postfix: KalturaZoomUsersMatching.doNotModify
                    });
                    this._userPostfix.enable();
                }
            });

        this._postfix.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value === KalturaZoomUsersMatching.addPostfix && (this._profileForm.controls['enabled'].value)) {
                    this._userPostfix.enable();
                } else {
                    this._userPostfix.disable();
                }
            });
        this._createUser.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value) {
                    this._defaultUserId.disable();
                } else if (this._profileForm.controls['enabled'].value) {
                    this._defaultUserId.enable();
                }
                this.validate();
            });
        this._defaultUserId.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                this.validate();
            });
        this._upload.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                this.validate();
            });
        this._uploadIn.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                this.validate();
            });
        this._uploadOut.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                this.validate();
            });

 */
    }

    private validate(): void {
        const formValue = this._profileForm.getRawValue();
        this.formValid = this._profileForm.valid;
        // this.formValid = formValue.defaultUserId.length || (!formValue.defaultUserId.length && formValue.createUser);
        // if (this.formValid && formValue.upload === 1) {
        //     this.formValid = formValue.uploadIn !== null && formValue.uploadIn.length > 0;
        // }
        // if (this.formValid && formValue.upload === 2) {
        //     this.formValid = formValue.uploadOut !== null && formValue.uploadOut.length > 0;
        // }
    }

    public openHelpLink(): void {
        this._browserService.openLink('https://marketplace.zoom.us/docs/api-reference/zoom-api/users/user');
    }

    public _save(): void {
        this._logger.info(`handle 'save' action by the user`);
        const formValue = this._profileForm.getRawValue();
        console.log(formValue);
        return;
        /*
        this._profile.enableRecordingUpload = formValue.enabled ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        this._profile.zoomAccountDescription = formValue.description;
        this._profile.defaultUserId = formValue.defaultUserId.length ? formValue.defaultUserId[0].screenName : '';
        if (formValue.uploadIn.length) {
            let optInGroups = [];
            formValue.uploadIn.forEach(group => optInGroups.push(group.id));
            this._profile.optInGroupNames = optInGroups.join(this.groupsDelimiter);
        } else {
            this._profile.optInGroupNames = null;
        }
        if (formValue.uploadOut.length) {
            let optOutGroups = [];
            formValue.uploadOut.forEach(group => optOutGroups.push(group.id));
            this._profile.optOutGroupNames = optOutGroups.join(this.groupsDelimiter);
        } else {
            this._profile.optOutGroupNames = null;
        }
        this._profile.zoomCategory = formValue.categories.length ? (formValue.categories[0].fullName ? formValue.categories[0].fullName : formValue.categories[0].name) : '';
        this._profile.zoomWebinarCategory = formValue.webinarCategory.length ? formValue.webinarCategory[0].name : '';
        if (this._showDeleteContent) {
            this._profile.deletionPolicy = formValue.deleteContent ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        }
        this._profile.createUserIfNotExist = formValue.createUser ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        if (this._showTranscription) {
            this._profile.enableZoomTranscription = formValue.transcription ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        }
        if (this._enableMeetingUpload) {
            this._profile.enableMeetingUpload = formValue.uploadMeeting ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        }
        this._profile.enableWebinarUploads = formValue.uploadWebinar ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        if (formValue.userId) {
            this._profile.zoomUserMatchingMode = formValue.postfix;
        } else {
            this._profile.zoomUserMatchingMode = KalturaZoomUsersMatching.cmsMatching;
        }
        this._profile.zoomUserPostfix = formValue.userPostfix;
        this._profile.handleParticipantsMode = formValue.participation;
        this._profile.handleAlternativeHostsMode = formValue.altHosts;
        this._profile.handleCohostsMode = formValue.coHosts;
        this._profile.groupParticipationType = formValue.upload;

         */
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
                const profileCategories = this._profile.settings?.categoryIds && this._profile.settings?.categoryIds.length ? this._profile.settings.categoryIds : [];
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

