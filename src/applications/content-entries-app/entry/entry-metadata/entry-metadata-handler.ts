import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { Observable } from 'rxjs/Observable';

import { KalturaResponse } from '@kaltura-ng2/kaltura-api/';
import { CategoryEntryListAction } from '@kaltura-ng2/kaltura-api/services/category-entry';
import { KalturaCategoryEntryFilter, KalturaCategoryEntryListResponse, KalturaCategoryListResponse } from '@kaltura-ng2/kaltura-api/types';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { TagSearchAction } from '@kaltura-ng2/kaltura-api/services/tag'
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaTagFilter, KalturaTaggedObjectType, KalturaFilterPager } from '@kaltura-ng2/kaltura-api/types';
import { CategoriesStore, CategoryData } from '../../../../shared/kmc-content-ui/categories-store.service';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { MetadataProfileStore, MetadataProfileTypes, MetadataProfileCreateModes, MetadataProfile, MetadataFieldTypes } from '@kaltura-ng2/kaltura-common';

export interface EntryCategories
{ items : CategoryData[],
    loading : boolean,
    error? : any
};

@Injectable()
export class EntryMetadataHandler extends EntrySectionHandler implements  OnDestroy
{
    private _entryCategories : BehaviorSubject<EntryCategories> = new BehaviorSubject<EntryCategories>({items : [], loading : false});

    public entryCategories$ = this._entryCategories.asObservable();

    private _metadataProfilesRequested = false;
    private _metadataProfiles : BehaviorSubject<{ items : MetadataProfile[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : MetadataProfile[], loading : boolean, error? : any}>(
        { items : null, loading : false}
    );

    public _metadataProfiles$ = this._metadataProfiles.asObservable();


    constructor(store : EntryStore,
                kalturaServerClient: KalturaServerClient,
                private _categoriesStore : CategoriesStore,
                private _metadataProfileStore : MetadataProfileStore)
    {
        super(store, kalturaServerClient);

        store.events$
            .cancelOnDestroy(this)
            .subscribe(
            event =>
            {

            }
        );
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Metadata;
    }

    protected _onSectionLoading(data) : void {
        data.requests.push(new CategoryEntryListAction(
            {
                filter: new KalturaCategoryEntryFilter().setData(
                    filter => {
                        filter.entryIdEqual = data.entryId;
                    }
                )
            }
        ).setCompletion(this._onEntryCategoriesLoaded.bind(this)));

        if (!this._metadataProfilesRequested)
        {
            this._metadataProfilesRequested = true;

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
    }


    private _onEntryCategoriesLoaded(response : KalturaResponse<KalturaCategoryEntryListResponse>) : void {
        if (response.result) {
            const categoriesList = response.result.objects.map(category => category.categoryId);

            this._categoriesStore.getCategoriesFromList(categoriesList)
                .cancelOnDestroy(this)
                .subscribe(
                categories =>
                {
                    console.log("entryMetadataHandler._onEntryCategoriesLoaded(): next", categories);
                },
                (error) =>
                {
                    console.log("entryMetadataHandler._onEntryCategoriesLoaded(): error",error);
                },
                    () =>
                    {
                        console.log("entryMetadataHandler._onEntryCategoriesLoaded(): complete");
                    }
            );

        } else {
            // TODO
        }
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
                    .cancelOnDestroy(this)
                    .monitor('search tags')
                    .subscribe(
                    result =>
                    {
                        console.log("entryMetadataHandler.searchTags(): next");
                        const tags = result.objects.map(item => item.tag);
                        observer.next(tags);
                    },
                    err =>
                    {
                        console.log("entryMetadataHandler.searchTags(): error",err);
                        observer.error(err);
                    },
                        () =>
                        {
                            console.log("entryMetadataHandler.searchTags(): complete");
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
    _resetSection()
    {
        this._entryCategories.next({ items : [], loading : false});
    }

}