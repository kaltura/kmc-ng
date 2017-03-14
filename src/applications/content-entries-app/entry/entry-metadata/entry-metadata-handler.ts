import { Injectable } from '@angular/core';
import { FormSectionHandler, ActivateArgs, ValidateResult } from '../../entry-store/form-section-handler';
import { KalturaLiveStreamEntry } from '@kaltura-ng2/kaltura-api/types';
import { Observable } from 'rxjs/Observable';
import { CategoryEntryListAction } from '@kaltura-ng2/kaltura-api/services/category-entry';
import { KalturaCategoryEntryFilter,  KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TagSearchAction } from '@kaltura-ng2/kaltura-api/services/tag'
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaTagFilter, KalturaTaggedObjectType, KalturaFilterPager } from '@kaltura-ng2/kaltura-api/types';
import { CategoriesStore, CategoryData } from '../../../../shared/kmc-content-ui/categories-store.service';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { MetadataProfileStore, MetadataProfileTypes, MetadataProfileCreateModes, MetadataProfile, MetadataFieldTypes } from '@kaltura-ng2/kaltura-common';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { FormSectionsManager } from '../../entry-store/form-sections-manager';

export interface EntryCategories
{ items : CategoryData[],
    loading : boolean,
    error? : any
};

@Injectable()
export class EntryMetadataHandler extends FormSectionHandler
{
    private _entryCategories : BehaviorSubject<EntryCategories> = new BehaviorSubject<EntryCategories>({items : [], loading : false});
    public metadataForm : FormGroup;
    public _categoriesControl : FormControl;

    public entryCategories$ = this._entryCategories.asObservable().monitor('entry categories');

    private _metadataProfiles : BehaviorSubject<{ items : MetadataProfile[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : MetadataProfile[], loading : boolean, error? : any}>(
        { items : null, loading : false}
    );

    public _metadataProfiles$ = this._metadataProfiles.asObservable().monitor('metadata profiles');

    constructor(manager : FormSectionsManager,
                private _kalturaServerClient: KalturaServerClient,
                private _categoriesStore : CategoriesStore,
                private _formBuilder : FormBuilder,
                private _metadataProfileStore : MetadataProfileStore)
    {
        super(manager, _kalturaServerClient);

        this._buildForm();
    }

    private _buildForm() : void{
        this._categoriesControl = new FormControl();
        this.metadataForm = this._formBuilder.group({
            name : ['', Validators.required],
            description : '',
            tags : null,
            categories : this._categoriesControl,
            offlineMessage : '',
            referenceId : '',
        });

        this.metadataForm.statusChanges
            .cancelOnDestroy(this)
            .subscribe(
                value =>
                {
                    super._notifySectionStatus({isValid : value === 'VALID'});
                }
            )

    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Metadata;
    }




    protected _activate(args : ActivateArgs) : void {

        this._resetEntryCategories(this.entry);
        this._resetForm(this.entry);

        if (args.firstLoad)
        {
            this._fetchProfileMetadata();

        }
    }

    private _resetEntryCategories(entry : KalturaMediaEntry) : void {
        // update entry categories
        this._entryCategories.next({loading: true, items: []});
        this._categoriesControl.disable();

        this._kalturaServerClient.request(new CategoryEntryListAction(
            {
                filter: new KalturaCategoryEntryFilter().setData(
                    filter => {
                        filter.entryIdEqual = entry.id;
                    }
                )
            }
        ))
            .cancelOnDestroy(this,this.sectionReset$)
            .monitor('get entry categories')
            .subscribe(
                (response) => {
                    const categoriesList = response.objects.map(category => category.categoryId);

                    if (categoriesList.length) {
                        this._categoriesStore.getCategoriesFromList(categoriesList)
                            .cancelOnDestroy(this, this.sectionReset$)
                            .monitor('get entry categories (phase 2)')
                            .subscribe(
                                categories => {
                                    this._entryCategories.next({loading: false, items: categories.items});

                                    this.metadataForm.patchValue(
                                        {
                                            categories : categories.items
                                        }
                                    );
                                    this._categoriesControl.enable();
                                },
                                (error) => {
                                    this._entryCategories.next({loading: false, items: [], error: error});
                                }
                            );
                    }else {
                        this._categoriesControl.enable();
                    }
                },
                error => {
                    this._entryCategories.next({loading: false, items: [], error: error});
                }
            );

    }

    private _fetchProfileMetadata() : void{
        this._metadataProfileStore.get({ type : MetadataProfileTypes.Entry, ignoredCreateMode : MetadataProfileCreateModes.App})
            .cancelOnDestroy(this)
            .monitor('load metadata profiles')
            .subscribe(
                response =>
                {
                    this._metadataProfiles.next({items : response.items, loading : false});
                },
                error =>
                {
                    this._metadataProfiles.next({items : [], loading : false, error : error});
                }
            );
    }

    private _resetForm(entry : KalturaMediaEntry) : void {
        this.metadataForm.reset(
            {
                name: entry.name,
                description: entry.description || null,
                tags: (entry.tags ? entry.tags.split(', ') : null), // for backward compatibility we split values by ',{space}'
                categories: '',
                offlineMessage: entry instanceof KalturaLiveStreamEntry ? (entry.offlineMessage || null) : '',
                referenceId: entry.referenceId || null
            }
        );
    }

    public searchTags(text : string)
    {
        return Observable.create(
            observer => {
                const requestSubscription = this._kalturaServerClient.request(
                    new TagSearchAction(
                        {
                            tagFilter: new KalturaTagFilter().setData(
                                filter => {
                                    filter.tagStartsWith = text;
                                    filter.objectTypeEqual = KalturaTaggedObjectType.Entry
                                }
                            ),
                            pager: new KalturaFilterPager().setData(
                                pager => {
                                    pager.pageIndex = 0;
                                    pager.pageSize = 30;
                                }
                            )
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
    protected reset()
    {
        this._entryCategories.next({ items : [], loading : false});
        this._categoriesControl.disable();
        this.metadataForm.reset();
    }

    _validate() : Observable<ValidateResult>
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