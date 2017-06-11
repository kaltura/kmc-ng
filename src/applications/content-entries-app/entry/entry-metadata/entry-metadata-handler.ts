import { Injectable } from '@angular/core';
import { IterableDiffers, IterableDiffer, IterableChangeRecord } from '@angular/core';
import { EntryFormWidget } from '../entry-form-widget';
import { Observable } from 'rxjs/Observable';
import { KalturaCategoryEntryFilter,  KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaTagFilter, KalturaTaggedObjectType, KalturaFilterPager,
    TagSearchAction, CategoryEntryListAction, KalturaLiveStreamEntry } from 'kaltura-typescript-client/types/all';
import { CategoriesStore } from '../../shared/categories-store.service';
import { EntryWidgetKeys } from '../entry-widget-keys';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { MetadataProfileStore, MetadataProfileTypes, MetadataProfileCreateModes } from '@kaltura-ng2/kaltura-common';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaCustomMetadata } from '@kaltura-ng2/kaltura-ui/dynamic-form/kaltura-custom-metadata';
import { MetadataListAction, KalturaMetadataFilter, KalturaMetadata, MetadataUpdateAction, MetadataAddAction, KalturaMetadataObjectType, CategoryEntryAddAction, CategoryEntryDeleteAction, KalturaCategoryEntry } from 'kaltura-typescript-client/types/all';
import { KalturaCustomDataHandler } from '@kaltura-ng2/kaltura-ui/dynamic-form/kaltura-custom-metadata';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/catch';

export interface EntryCategoryItem
{ id : number, fullIdPath : (string | number)[], name : string }

@Injectable()
export class EntryMetadataHandler extends EntryFormWidget
{
    private _entryCategoriesDiffers : IterableDiffer<EntryCategoryItem>;
    public _entryCategories : EntryCategoryItem[]  = [];
    private _entryMetadata : KalturaMetadata[] = [];

    public isLiveEntry : boolean;
    public metadataForm : FormGroup;
    public customDataForms : KalturaCustomDataHandler[] = [];

    constructor(private _kalturaServerClient: KalturaClient,
                private _categoriesStore : CategoriesStore,
                private _formBuilder : FormBuilder,
                private _iterableDiffers : IterableDiffers,
                private _kalturaCustomMetadata : KalturaCustomMetadata,
                private _metadataProfileStore : MetadataProfileStore)
    {
        super(EntryWidgetKeys.Metadata);

        this._buildForm();
    }

    private _buildForm() : void {
        this.metadataForm = this._formBuilder.group({
            name: ['', Validators.required],
            description: '',
            tags: null,
            categories: null,
            offlineMessage: '',
            referenceId: '',
            entriesIdList: null
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
                        super._updateWidgetState({
                            isValid: isValid,
                            isDirty: isDirty
                        });
                    }
                }
            );
    }

    public setDirty()
    {
	    super._updateWidgetState({
		    isDirty: true
	    });
    }

    protected _onActivate(firstTimeActivating : boolean) : Observable<{failed : boolean}> {

        super._showLoader();
        super._removeBlockerMessage();

        this.isLiveEntry = this.data instanceof KalturaLiveStreamEntry;

        const actions: Observable<{failed: boolean, error?: Error}>[] = [
            this._loadEntryCategories(this.data),
            this._loadEntryMetadata(this.data)
        ];

        if (firstTimeActivating) {
            actions.push(this._loadProfileMetadata());
        }


        return Observable.forkJoin(actions)
            .catch((error, caught) => {
                return Observable.of([{failed: true}]);
            })
            .map(responses => {
                super._hideLoader();

                let hasFailure = (<Array<{failed: boolean, error?: Error}>>responses).reduce((result, response) => result || response.failed, false);;

                if (hasFailure) {
                    super._showActivationError();
                    return {failed: true};
                } else {
                    try {
                        // the sync function is dealing with dynamically created forms so mistakes can happen
                        // as result of undesired metadata schema.
                        this._syncHandlerContent();
                        return {failed: false};
                    } catch (e) {
                        super._showActivationError();
                        return {failed: true, error: e};
                    }
                }
            });
    }

    private _syncHandlerContent()
    {
        this.metadataForm.reset(
            {
                name: this.data.name,
                description: this.data.description || null,
                tags: (this.data.tags ? this.data.tags.split(', ') : null), // for backward compatibility we split values by ',{space}'
                categories: this._entryCategories,
                offlineMessage: this.data instanceof KalturaLiveStreamEntry ? (this.data.offlineMessage || null) : '',
                referenceId: this.data.referenceId || null,
                entriesIdList : ['1_rbyysqbe','0_hp3s3647','1_4gs7ozgq']
            }
        );

        this._entryCategoriesDiffers = this._iterableDiffers.find([]).create<EntryCategoryItem>((index, item) =>
        {
            // use track by function to identify category by its' id. this will prevent sending add/remove of the same item once
            // a user remove a category and then re-select it before he clicks the save button.
            return item ? item.id : null;
        });
        this._entryCategoriesDiffers.diff(this._entryCategories);

        // map entry metadata to profile metadata
        if (this.customDataForms)
        {
            this.customDataForms.forEach(customDataForm =>
            {
                const entryMetadata = this._entryMetadata.find(item => item.metadataProfileId === customDataForm.metadataProfile.id);

                // reset with either a valid entry metadata or null if not found a matching metadata for that entry
                customDataForm.resetForm(entryMetadata);
            });
        }

        this._monitorFormChanges();
    }

    private _loadEntryMetadata(entry : KalturaMediaEntry) : Observable<{failed : boolean, error? : Error}> {

        // update entry categories
        this._entryMetadata = [];

        return this._kalturaServerClient.request(new MetadataListAction(
            {
                filter: new KalturaMetadataFilter(
                    {
                        objectIdEqual: entry.id
                    }
                )
            }
        ))
            .cancelOnDestroy(this, this.widgetReset$)
            .monitor('get entry custom metadata')
            .do(response => {
                    this._entryMetadata = response.objects;
                })
            .map(response => ({failed : false}))
            .catch((error,caught) => Observable.of({failed : true, error}))
    }

    private _loadEntryCategories(entry : KalturaMediaEntry) : Observable<{failed : boolean, error? : Error}> {

        // update entry categories
        this._entryCategories = [];

        return this._kalturaServerClient.request(
            new CategoryEntryListAction(
                {
                    filter: new KalturaCategoryEntryFilter({
                        entryIdEqual: entry.id
                    })
                }
            ))
            .flatMap(response => {
                const categoriesList = response.objects.map(category => category.categoryId);

                if (categoriesList.length) {
                    return this._categoriesStore.getCategoriesFromList(categoriesList);
                } else {
                    return Observable.of({items: []});
                }
            })
            .monitor('get entry categories')
            .cancelOnDestroy(this, this.widgetReset$)
            .do(
                categories =>
                {
                    this._entryCategories = categories.items.map(category => ({ id : category.id, name : category.name, fullIdPath : category.fullIdPath}));
                }
            )
            .map(response => ({failed : false}))
            .catch((error,caught) => Observable.of({failed : true, error}));
    }

    private _loadProfileMetadata() : Observable<{failed : boolean, error? : Error}> {
        return this._metadataProfileStore.get({
            type: MetadataProfileTypes.Entry,
            ignoredCreateMode: MetadataProfileCreateModes.App
        })
            .cancelOnDestroy(this)
            .monitor('load metadata profiles')
            .do(response => {

                this.customDataForms = [];
                if (response.items) {
                    response.items.forEach(serverMetadata => {
                        const newCustomDataForm = this._kalturaCustomMetadata.createHandler(serverMetadata);
                        this.customDataForms.push(newCustomDataForm);
                    });
                }
            })
            .map(response => ({failed: false}))
            .catch((error, caught) => Observable.of({failed: true, error}));
    }

    protected _onDataSaving(newData : KalturaMediaEntry, request : KalturaMultiRequest) : void
    {

	    const metadataFormValue = this.metadataForm.value;

        // save static metadata form
        newData.name = metadataFormValue.name;
        newData.description = metadataFormValue.description;
        newData.referenceId = metadataFormValue.referenceId || null;
        newData.tags = (metadataFormValue.tags || []).join(', ');
        if (newData instanceof KalturaLiveStreamEntry)
        {
            newData.offlineMessage = metadataFormValue.offlineMessage;
        }

        // save changes in entry categories
        if (this._entryCategoriesDiffers) {
            const changes = this._entryCategoriesDiffers.diff(metadataFormValue.categories);

            if (changes)
            {
                changes.forEachAddedItem((change : IterableChangeRecord<EntryCategoryItem>) =>
                {
                    request.requests.push(new CategoryEntryAddAction({
                        categoryEntry : new KalturaCategoryEntry({
                            entryId : this.data.id,
                            categoryId : change.item.id
                        })
                    }));
                });

                changes.forEachRemovedItem((change : IterableChangeRecord<EntryCategoryItem>) =>
                {
                    request.requests.push(new CategoryEntryDeleteAction({
                        entryId : this.data.id,
                        categoryId : change.item.id
                    }));
                });
            }
        }

        // save entry custom schema forms
        if (this.customDataForms) {
            this.customDataForms.forEach(customDataForm => {

                if (customDataForm.dirty) {

                    const customDataValue = customDataForm.getValue();

                    if (customDataValue.error) {
                        throw new Error('One of the forms is invalid');
                    } else {

                        const entryMetadata = this._entryMetadata.find(item => item.metadataProfileId === customDataForm.metadataProfile.id);

                        if (entryMetadata) {
                            request.requests.push(new MetadataUpdateAction({
                                id: entryMetadata.id,
                                xmlData: customDataValue.xml
                            }));
                        }else
                        {
                            request.requests.push(new MetadataAddAction({
                                objectType : KalturaMetadataObjectType.entry,
                                objectId : this.data.id,
                                metadataProfileId : customDataForm.metadataProfile.id,
                                xmlData: customDataValue.xml
                            }));
                        }
                    }
                }
            });
        }
    }

    public searchTags(text : string)
    {
        return Observable.create(
            observer => {
                const requestSubscription = this._kalturaServerClient.request(
                    new TagSearchAction(
                        {
                            tagFilter: new KalturaTagFilter(
                                {
                                    tagStartsWith : text,
                                    objectTypeEqual : KalturaTaggedObjectType.entry
                                }
                            ),
                            pager: new KalturaFilterPager({
                                pageIndex : 0,
                                pageSize : 30
                            })
                        }
                    )
                )
                    .cancelOnDestroy(this, this.widgetReset$)
                    .monitor('search tags')
                    .subscribe(
                    result =>
                    {
                        const tags = result.objects.map(item => item.tag);
                        observer.next(tags);
                        observer.complete();
                    },
                    err =>
                    {
                        observer.error(err);
                    }
                );

                return () =>
                {
                    console.log("entryMetadataHandler.searchTags(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

    public searchCategories(text : string)
    {
        return Observable.create(
            observer => {

                const requestSubscription = this._categoriesStore.getSuggestions(text)
                    .cancelOnDestroy(this, this.widgetReset$)
                    .monitor('search categories')
                    .subscribe(
                        result =>
                        {
                            observer.next(result.items);
                            observer.complete();
                        },
                        err =>
                        {
                            observer.error(err);
                        }
                    );

                return () =>
                {
                    console.log("entryMetadataHandler.searchTags(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onReset() {

        this.metadataForm.reset({});
        this._entryCategoriesDiffers = null;
        this._entryCategories = [];
        this._entryMetadata = [];
        this.isLiveEntry = false;
    }

    _onValidate() : Observable<{ isValid : boolean}>
    {
        return Observable.create(observer =>
        {
            this.metadataForm.updateValueAndValidity();
            const isValid = this.metadataForm.valid;
            observer.next({  isValid });
            observer.complete();
        });
    }
}
