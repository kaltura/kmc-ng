import { Injectable } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { KalturaLiveStreamEntry } from '@kaltura-ng2/kaltura-api/types';
import { Observable } from 'rxjs/Observable';
import { KalturaCategoryEntryFilter,  KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaTagFilter, KalturaTaggedObjectType, KalturaFilterPager,
    TagSearchAction, CategoryEntryListAction } from '@kaltura-ng2/kaltura-api/types';
import { CategoriesStore, CategoryData } from '../../../../shared/kmc-content-ui/categories-store.service';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { MetadataProfile, MetadataProfileStore, MetadataProfileTypes, MetadataProfileCreateModes } from '@kaltura-ng2/kaltura-common';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';
import { KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { KalturaCustomMetadata } from '@kaltura-ng2/kaltura-ui/dynamic-form/kaltura-custom-metadata';
import { MetadataListAction, KalturaMetadataFilter, KalturaMetadata, MetadataUpdateAction } from '@kaltura-ng2/kaltura-api/types';
import { KalturaCustomDataHandler } from '@kaltura-ng2/kaltura-ui/dynamic-form/kaltura-custom-metadata';

@Injectable()
export class EntryMetadataHandler extends EntrySection
{
    private _entryCategories : CategoryData[]  = [];
    private _entryMetadata : KalturaMetadata[] = [];

    private _entryCategoriesStatus : 'loading' | 'loaded' | Error = null;
    private _profileMetadataStatus : 'loading' | 'loaded' | Error = null;
    private _entryMetadataStatus : 'loading' | 'loaded' | Error = null;

    public metadataForm : FormGroup;
    public customDataForms : KalturaCustomDataHandler[] = [];
    public loading = false;
    public loadingError = null;


    constructor(manager : EntrySectionsManager,
                private _kalturaServerClient: KalturaServerClient,
                private _categoriesStore : CategoriesStore,
                private _formBuilder : FormBuilder,
                private _kalturaCustomMetadata : KalturaCustomMetadata,
                private _metadataProfileStore : MetadataProfileStore)
    {
        super(manager);

        this._buildForm();
    }

    private _buildForm() : void{
        this.metadataForm = this._formBuilder.group({
            name : ['', Validators.required],
            description : '',
            tags : null,
            categories : null,
            offlineMessage : '',
            referenceId : '',
        });

        this.metadataForm.statusChanges
            .cancelOnDestroy(this)
            .monitor('status changes')
            .subscribe(
                value =>
                {
                    super._onStatusChanged({isValid : value === 'VALID'});
                }
            )

    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Metadata;
    }



    protected _activate(firstLoad : boolean) : void {
        this.loading = true;

        this._loadEntryCategories(this.data);
        this._loadEntryMetadata(this.data);


        if (firstLoad) {
            this._loadProfileMetadata();
        }
    }

    private _updateForms() : void {
        const entry = this.data;
        let error : Error = null;


        if (entry
            && this._entryCategoriesStatus === 'loaded'
            && this._profileMetadataStatus === 'loaded'
            && this._entryMetadataStatus === 'loaded') {
            this.loading = false;
            this.metadataForm.reset(
                {
                    name: entry.name,
                    description: entry.description || null,
                    tags: (entry.tags ? entry.tags.split(', ') : null), // for backward compatibility we split values by ',{space}'
                    categories: this._entryCategories,
                    offlineMessage: entry instanceof KalturaLiveStreamEntry ? (entry.offlineMessage || null) : '',
                    referenceId: entry.referenceId || null
                }
            );

            if (this._entryMetadata.length === this.customDataForms.length) {
                for(let i = 0;i < this.customDataForms.length;i++)
                {
                    this.customDataForms[i].syncValue(this._entryMetadata[i]);
                }
            }else
            {
                console.warn('KMCng: should implement');
                error = new Error("failed to load metadata");
            }

        } else {
            error = (this._entryCategoriesStatus instanceof Error ? this._entryCategoriesStatus : null)
                || (this._entryMetadataStatus instanceof Error ? this._entryMetadataStatus : null)
                || (this._profileMetadataStatus instanceof Error ? this._profileMetadataStatus : null);
        }


        if (error) {
            this.loading = false;
            this.loadingError = {
                message: error.message,
                buttons: {returnToEntries: 'Back To Entries', retry: 'Retry'}
            };
        }
    }

    private _loadEntryMetadata(entry : KalturaMediaEntry) : void {

        if (this._entryMetadataStatus === null || !(this._entryMetadataStatus instanceof Error)) {

            // update entry categories
            this._entryMetadata = [];

            this._kalturaServerClient.request(new MetadataListAction(
                {
                    filter: new KalturaMetadataFilter(
                        {
                            objectIdEqual: entry.id
                        }
                    )
                }
            ))
                .cancelOnDestroy(this, this.sectionReset$)
                .monitor('get entry custom metadata')
                .subscribe(
                    (response) => {
                        this._entryMetadataStatus = 'loaded';
                        this._entryMetadata = response.objects;

                        this._updateForms();
                    },
                    error => {
                        this._entryMetadataStatus = error;
                        this._updateForms();
                    }
                );
        }
    }

    private _loadEntryCategories(entry : KalturaMediaEntry) : void {

        if (this._entryCategoriesStatus === null || (this._entryCategoriesStatus instanceof Error)) {

            // update entry categories
            this._entryCategories = [];

            this._kalturaServerClient.request(
                new CategoryEntryListAction(
                    {
                        filter: new KalturaCategoryEntryFilter({
                            entryIdEqual : entry.id
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
                .cancelOnDestroy(this, this.sectionReset$)
                .subscribe(
                    categories => {
                        this._entryCategoriesStatus = 'loaded';
                        this._entryCategories = categories.items;

                        this._updateForms();
                    },
                    (error) => {
                        this._entryCategoriesStatus = error;
                        this._updateForms();
                    }
                );
        }
    }

    private _loadProfileMetadata() : void{
        if (this._profileMetadataStatus === null || (this._profileMetadataStatus instanceof Error)) {

            this._metadataProfileStore.get({
                type: MetadataProfileTypes.Entry,
                ignoredCreateMode: MetadataProfileCreateModes.App
            })
                .cancelOnDestroy(this)
                .monitor('load metadata profiles')
                .subscribe(
                    response => {

                        this.customDataForms = [];
                        if (response.items) {
                            response.items.forEach(serverMetadata =>
                            {
                                this.customDataForms.push(this._kalturaCustomMetadata.createHandler(serverMetadata));
                            });
                        }
                        this._profileMetadataStatus = 'loaded';
                        this._updateForms();
                    },
                    error => {
                        this._profileMetadataStatus = error;
                        this._updateForms();
                    }
                );
        }
    }

    protected _onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest)
    {
        for(let i = 0;i < this.customDataForms.length;i++)
        {
            const customDataForm = this.customDataForms[i];
            if (customDataForm.dirty) {
                console.warn('should check if the custom metadata form values were modified');

                const customDataValue = customDataForm.getValue();

                if (customDataValue.error) {
                    console.warn('KMCng: stop process and show error');
                } else {

                    customDataForm.metadataProfile
                    request.requests.push(new MetadataUpdateAction({
                        id: this._entryMetadata[i].id,
                        xmlData: customDataValue.xml
                    }));
                }
            }
        }

        this.customDataForms.forEach(customDataForm => {

        });
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
                    .cancelOnDestroy(this, this.sectionReset$)
                    .monitor('search tags')
                    .subscribe(
                    result =>
                    {
                        const tags = result.objects.map(item => item.tag);
                        observer.next(tags);
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
                    .cancelOnDestroy(this, this.sectionReset$)
                    .monitor('search categories')
                    .subscribe(
                        result =>
                        {
                            observer.next(result.items);
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
    protected _reset() {
        this._entryCategories = [];
        this._entryCategoriesStatus = null;
        this._entryMetadata = [];
        this._entryMetadataStatus = null;

        this.metadataForm.reset();
    }

    _validate() : Observable<{ isValid : boolean}>
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