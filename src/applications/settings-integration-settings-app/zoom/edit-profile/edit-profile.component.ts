import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { KalturaNullableBoolean, KalturaZoomIntegrationSetting, KalturaZoomUsersMatching } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { cancelOnDestroy } from "@kaltura-ng/kaltura-common";
import { Subject } from "rxjs/Subject";
import { SuggestionsProviderData } from "@kaltura-ng/kaltura-primeng-ui";
import { ISubscription } from "rxjs/Subscription";
import { Observable } from "rxjs";
import { CategoriesSearchService } from "app-shared/content-shared/categories/categories-search.service";
import { BrowserService } from "app-shared/kmc-shell";

@Component({
    selector: 'kZoomEditProfile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    providers: [CategoriesSearchService, KalturaLogger.createLogger('EditZoomProfileComponent')]
})
export class EditZoomProfileComponent implements OnInit, OnDestroy {
    @Input() parentPopup: PopupWidgetComponent;
    @Input() profile: KalturaZoomIntegrationSetting | null;

    @Output() onSave = new EventEmitter<KalturaZoomIntegrationSetting>();

    public _profileForm: FormGroup;

    public _recordingUpload: AbstractControl;
    public _accountId: AbstractControl;
    public _description: AbstractControl;
    public _deleteContent: AbstractControl;
    public _transcription: AbstractControl;
    public _defaultUserId: AbstractControl;
    public _userId: AbstractControl;
    public _postfix: AbstractControl;
    public _userPostfix: AbstractControl;
    public _participation: AbstractControl;
    public _categories: AbstractControl;

    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    private _searchCategoriesSubscription: ISubscription;

    constructor(private _appLocalization: AppLocalization,
                private _fb: FormBuilder,
                private _browserService: BrowserService,
                private _categoriesSearchService: CategoriesSearchService,
                private _logger: KalturaLogger) {
        this._buildForm();
    }

    ngOnInit() {
        if (this.profile) {
            this._setInitialValue(this.profile);
        }
    }

    ngOnDestroy() {
        this._categoriesProvider.complete();
    }

    private _setInitialValue(profile: KalturaZoomIntegrationSetting): void {
        this._profileForm.setValue({
            enabled: profile.enableRecordingUpload === KalturaNullableBoolean.trueValue,
            accountId: profile.accountId || '',
            defaultUserId: profile.defaultUserId || '',
            description: profile.zoomAccountDescription || '',
            deleteContent: profile.deletionPolicy === KalturaNullableBoolean.trueValue,
            transcription: profile.enableZoomTranscription === KalturaNullableBoolean.trueValue,
            userId: profile.zoomUserMatchingMode !== KalturaZoomUsersMatching.cmsMatching,
            postfix: profile.zoomUserMatchingMode,
            userPostfix: profile.zoomUserPostfix,
            participation: profile.handleParticipantsMode,
            categories: profile.zoomCategory ? [{name: profile.zoomCategory}] : []
        });
    }

    private _buildForm(): void {
        this._profileForm = this._fb.group({
            enabled: false,
            accountId: [''],
            defaultUserId: [''],
            description: [''],
            deleteContent: false,
            transcription: false,
            userId: false,
            postfix: null,
            userPostfix: [''],
            participation: null,
            categories: [[]]
        });

        this._recordingUpload = this._profileForm.controls['enabled'];
        this._accountId = this._profileForm.controls['accountId'];
        this._accountId.disable();
        this._defaultUserId = this._profileForm.controls['defaultUserId'];
        this._defaultUserId.disable();
        this._description = this._profileForm.controls['description'];
        this._deleteContent = this._profileForm.controls['deleteContent'];
        this._transcription = this._profileForm.controls['transcription'];
        this._userId = this._profileForm.controls['userId'];
        this._postfix = this._profileForm.controls['postfix'];
        this._userPostfix = this._profileForm.controls['userPostfix'];
        this._participation = this._profileForm.controls['participation'];
        this._categories = this._profileForm.controls['categories'];

        this._recordingUpload.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value) {
                    this._description.enable();
                    this._deleteContent.enable();
                    this._transcription.enable();
                    this._userId.enable();
                    this._postfix.enable();
                    this._userPostfix.enable();
                    this._participation.enable();
                    this._categories.enable();
                } else {
                    this._description.disable();
                    this._deleteContent.disable();
                    this._transcription.disable();
                    this._userId.disable();
                    this._postfix.disable();
                    this._userPostfix.disable();
                    this._participation.disable();
                    this._categories.disable();
                }
            });
        this._userId.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value === false) {
                    this._postfix.disable();
                    this._userPostfix.disable();
                } else {
                    this._postfix.enable();
                    this._profileForm.patchValue({
                        postfix: KalturaZoomUsersMatching.doNotModify
                    });
                    this._userPostfix.disable();
                }
            });
        this._postfix.valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(value => {
                if (value === KalturaZoomUsersMatching.addPostfix) {
                    this._userPostfix.enable();
                } else {
                    this._userPostfix.disable();
                }
            });
    }

    public openHelpLink(): void {
        this._browserService.openLink('https://marketplace.zoom.us/docs/api-reference/zoom-api/users/user');
    }

    public _save(): void {
        this._logger.info(`handle 'save' action by the user`);
        const formValue = this._profileForm.getRawValue();
        this.profile.enableRecordingUpload = formValue.enabled ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        this.profile.zoomAccountDescription = formValue.description;
        this.profile.zoomCategory = formValue.categories.length ? formValue.categories[0].name : '';
        this.profile.deletionPolicy = formValue.deleteContent ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        this.profile.enableZoomTranscription = formValue.transcription ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
        if (formValue.userId) {
            this.profile.zoomUserMatchingMode = formValue.postfix;
        } else {
            this.profile.zoomUserMatchingMode = KalturaZoomUsersMatching.cmsMatching;
        }
        this.profile.zoomUserPostfix = formValue.userPostfix;
        this.profile.handleParticipantsMode = formValue.participation;
        this.onSave.emit(this.profile);
        this.parentPopup.close();
    }

    public _searchCategories(event): void {
        this._categoriesProvider.next({suggestions: [], isLoading: true});
        if (this._searchCategoriesSubscription) {
            // abort previous request
            this._searchCategoriesSubscription.unsubscribe();
            this._searchCategoriesSubscription = null;
        }
        this._searchCategoriesSubscription = this.searchCategories(event.query).subscribe(data => {
                const suggestions = [];
                const profileCategories = this.profile.zoomCategory.split(',');
                (data || []).forEach(suggestedCategory => {
                    const label = suggestedCategory.fullName + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');
                    const isSelectable = !profileCategories.find(category => {
                        return category === suggestedCategory.name;
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

}

