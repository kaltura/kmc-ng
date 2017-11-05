import { MetadataAddAction } from 'kaltura-typescript-client/types/MetadataAddAction';
import { MetadataUpdateAction } from 'kaltura-typescript-client/types/MetadataUpdateAction';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaTagFilter } from 'kaltura-typescript-client/types/KalturaTagFilter';
import { TagSearchAction } from 'kaltura-typescript-client/types/TagSearchAction';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaTaggedObjectType } from 'kaltura-typescript-client/types/KalturaTaggedObjectType';
import { MetadataListAction } from 'kaltura-typescript-client/types/MetadataListAction';
import { KalturaMetadataObjectType } from 'kaltura-typescript-client/types/KalturaMetadataObjectType';
import { KalturaCategoryFilter } from 'kaltura-typescript-client/types/KalturaCategoryFilter';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { KalturaMetadataFilter } from 'kaltura-typescript-client/types/KalturaMetadataFilter';
import { KalturaMetadata } from 'kaltura-typescript-client/types/KalturaMetadata';
import { CategoryListAction } from 'kaltura-typescript-client/types/CategoryListAction';
import { Observable } from 'rxjs/Observable';
import { DynamicMetadataForm, MetadataProfileStore, MetadataProfileTypes, MetadataProfileCreateModes, DynamicMetadataFormFactory } from '@kaltura-ng/kaltura-server-utils';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CategoryWidgetKeys } from './../category-widget-keys';
import { Injectable, OnDestroy } from '@angular/core';
import { CategoryWidget } from "../category-widget";
import { KalturaMultiRequest } from 'kaltura-typescript-client';

@Injectable()
export class CategoryMetadataWidget extends CategoryWidget implements OnDestroy {

    public metadataForm: FormGroup;
    public customDataForms: DynamicMetadataForm[] = [];
    private _categoryMetadata: KalturaMetadata[] = [];

    constructor(private _kalturaServerClient: KalturaClient,
        private _formBuilder: FormBuilder,
        private _metadataProfileStore: MetadataProfileStore,
        private _dynamicMetadataFormFactory: DynamicMetadataFormFactory) {
        super(CategoryWidgetKeys.Metadata);

        this._buildForm();
    }

    private _buildForm(): void {
        this.metadataForm = this._formBuilder.group({
            name: ['', Validators.required],
            description: '',
            tags: null,
            offlineMessage: '',
            referenceId: ''
        });
    }

    private _monitorFormChanges() {
        const formGroups = [this.metadataForm, ...this.customDataForms.map(customDataForm => customDataForm.formGroup)];
        const formsChanges: Observable<any>[] = [];

        formGroups.forEach(formGroup => {
            formsChanges.push(formGroup.valueChanges, formGroup.statusChanges);
        });

        Observable.merge(...formsChanges)
            .cancelOnDestroy(this, this.widgetReset$)
            .subscribe(
            () => {
                let isValid = true;
                let isDirty = false;

                formGroups.forEach(formGroup => {
                    isValid = isValid && formGroup.status === 'VALID';
                    isDirty = isDirty || formGroup.dirty;

                });

                if (this.isDirty !== isDirty || this.isValid !== isValid) {
                    super.updateState({
                        isValid: isValid,
                        isDirty: isDirty
                    });
                }
            }
            );
    }

    public setDirty() {
        super.updateState({
            isDirty: true
        });
    }

    protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean }> {

        super._showLoader();
        super._removeBlockerMessage();

        const actions: Observable<{ failed: boolean, error?: Error }>[] = [
            this._loadCategoryMetadata(this.data)
        ];

        if (firstTimeActivating) {
            actions.push(this._loadProfileMetadata());
        }


        return Observable.forkJoin(actions)
            .catch((error, caught) => {
                return Observable.of([{ failed: true }]);
            })
            .map(responses => {
                super._hideLoader();

                let hasFailure = (<Array<{ failed: boolean, error?: Error }>>responses).reduce((result, response) => result || response.failed, false);;

                if (hasFailure) {
                    super._showActivationError();
                    return { failed: true };
                } else {
                    try {
                        // the sync function is dealing with dynamically created forms so mistakes can happen
                        // as result of undesired metadata schema.
                        this._syncHandlerContent();
                        return { failed: false };
                    } catch (e) {
                        super._showActivationError();
                        return { failed: true, error: e };
                    }
                }
            });
    }

    private _syncHandlerContent() {

        // validate reference ID
        let referenceId: string = '';
        if (!this.data.referenceId &&
            this.data.referenceId != "" &&
            this.data.referenceId != "__null_string__") {
            referenceId = this.data.referenceId;
        }

        this.metadataForm.reset(
            {
                name: this.data.name,
                description: this.data.description || null,
                tags: (this.data.tags ? this.data.tags.split(',').map(item => item.trim()) : null), // for backward compatibility we handle values separated with ',{space}'
                referenceId: referenceId
            }
        );

        // map category metadata to profile metadata
        if (this.customDataForms) {
            this.customDataForms.forEach(customDataForm => {
                const categoryMetadata = this._categoryMetadata.find(item => item.metadataProfileId === customDataForm.metadataProfile.id);

                // reset with either a valid category metadata or null if not found a matching metadata for that category
                customDataForm.resetForm(categoryMetadata);
            });
        }

        this._monitorFormChanges();
    }

    private _loadCategoryMetadata(category: KalturaCategory): Observable<{ failed: boolean, error?: Error }> {

        this._categoryMetadata = [];

        return this._kalturaServerClient.request(new MetadataListAction(
            {
                filter: new KalturaMetadataFilter(
                    {
                        objectIdEqual: category.id.toString(),
                        metadataObjectTypeEqual: KalturaMetadataObjectType.category
                    }
                )
            }
        ))
            .cancelOnDestroy(this, this.widgetReset$)
            .monitor('get category custom metadata')
            .do(response => {
                this._categoryMetadata = response.objects;
            })
            .map(response => ({ failed: false }))
            .catch((error, caught) => Observable.of({ failed: true, error }))
    }

    private _loadProfileMetadata(): Observable<{ failed: boolean, error?: Error }> {
        return this._metadataProfileStore.get({
            type: MetadataProfileTypes.Category,
            ignoredCreateMode: MetadataProfileCreateModes.App
        })
            .cancelOnDestroy(this)
            .monitor('load metadata profiles')
            .do(response => {

                this.customDataForms = [];
                if (response.items) {
                    response.items.forEach(serverMetadata => {
                        const newCustomDataForm = this._dynamicMetadataFormFactory.createHandler(serverMetadata);
                        this.customDataForms.push(newCustomDataForm);
                    });
                }
            })
            .map(response => ({ failed: false }))
            .catch((error, caught) => Observable.of({ failed: true, error }));
    }

    protected onDataSaving(newData: KalturaCategory, request: KalturaMultiRequest): void {

        const metadataFormValue = this.metadataForm.value;

        // save static metadata form
        newData.name = metadataFormValue.name;
        newData.description = metadataFormValue.description;
        newData.referenceId = metadataFormValue.referenceId || null;
        newData.tags = (metadataFormValue.tags || []).join(',');

        // save entry custom schema forms
        if (this.customDataForms) {
            this.customDataForms.forEach(customDataForm => {

                if (customDataForm.dirty) {

                    const customDataValue = customDataForm.getValue();
                    if (customDataValue.error) {
                        throw new Error('One of the forms is invalid');
                    } else {

                        const entryMetadata = this._categoryMetadata.find(item => item.metadataProfileId === customDataForm.metadataProfile.id);
                        if (entryMetadata) {
                            request.requests.push(new MetadataUpdateAction({
                                id: entryMetadata.id,
                                xmlData: customDataValue.xml
                            }));
                        } else {
                            request.requests.push(new MetadataAddAction({
                                objectType: KalturaMetadataObjectType.category,
                                objectId: this.data.id.toString(),
                                metadataProfileId: customDataForm.metadataProfile.id,
                                xmlData: customDataValue.xml
                            }));
                        }
                    }
                }
            });
        }
    }

    public searchTags(text: string): Observable<string[]> {
        return Observable.create(
            observer => {
                const requestSubscription = this._kalturaServerClient.request(
                    new TagSearchAction(
                        {
                            tagFilter: new KalturaTagFilter(
                                {
                                    tagStartsWith: text,
                                    objectTypeEqual: KalturaTaggedObjectType.category
                                }
                            ),
                            pager: new KalturaFilterPager({
                                pageIndex: 0,
                                pageSize: 30
                            })
                        }
                    )
                )
                    .cancelOnDestroy(this, this.widgetReset$)
                    .monitor('search tags')
                    .subscribe(
                    result => {
                        const tags = result.objects.map(item => item.tag);
                        observer.next(tags);
                        observer.complete();
                    },
                    err => {
                        observer.error(err);
                    }
                    );

                return () => {
                    console.log("categoryMetadataHandler.searchTags(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

    /**
   * Do some cleanups if needed once the section is removed
   */
    protected onReset() {
        this.metadataForm.reset({});
        this._categoryMetadata = [];
    }

    onValidate(): Observable<{ isValid: boolean }> {
        return Observable.create(observer => {
            this.metadataForm.updateValueAndValidity();
            const isValid = this.metadataForm.valid;
            observer.next({ isValid });
            observer.complete();
        });
    }

    ngOnDestroy()
    {

    }
}


