import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';

import { EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { EntriesTableComponent } from 'app-shared/content-shared/entries-table/entries-table.component';
import { EntriesFilters, EntriesFiltersService } from 'app-shared/content-shared/entries-store/entries-filters.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Router } from '@angular/router';
import * as moment from 'moment';

// TODO sakal remove
function mapFromArray(array, prop) {
    var map = {};
    for (var i=0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}


function getDelta<T>(source : T[], compareTo : T[], keyPropertyName : string, comparator : (a : T, b : T) => boolean) : { added : T[], deleted : T[], changed : T[]} {
    var delta = {
        added: [],
        deleted: [],
        changed: []
    };

    var mapSource = mapFromArray(source, keyPropertyName);
    var mapCompareTo = mapFromArray(compareTo, keyPropertyName);
    for (var id in mapSource) {
        if (!mapCompareTo.hasOwnProperty(id)) {
            delta.deleted.push(mapSource[id]);
        } else if (!comparator(mapCompareTo[id], mapSource[id])){
            delta.changed.push(mapCompareTo[id]);
        }
    }

    for (var id in mapCompareTo) {
        if (!mapSource.hasOwnProperty(id)) {
            delta.added.push( mapCompareTo[id] )
        }
    }
    return delta;
}


@Component({
  selector: 'kEntriesList',
  templateUrl: './entries-list.component.html',
  styleUrls: ['./entries-list.component.scss']
})
export class EntriesListComponent implements OnInit, OnDestroy {
  @Input() isBusy = false;
  @Input() blockerMessage: AreaBlockerMessage = null;
  @Input() selectedEntries: any[] = [];
  @Input() columns: EntriesTableColumns | null;
  @Input() rowActions: { label: string, commandName: string }[];

  @ViewChild('tags') private tags: StickyComponent;

  @Output() onActionsSelected = new EventEmitter<{ action: string, entryId: string }>();
  public _filterTags : { type : string, value? : string, label : string, tooltip : {token : string, args?: any[]}}[] = [];
  private _handledFiltersInTags : EntriesFilters = null;

    private querySubscription: ISubscription;

  public _filter = {
    pageIndex: 0,
    freetextSearch: '',
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(private _entriesStore: EntriesStore,
              private _entriesFilters : EntriesFiltersService,
              private appLocalization: AppLocalization,
              private router: Router,
              private _browserService: BrowserService) {
  }

  removeTag(tag: any) {
    this.clearSelection();

    switch (tag.type)
    {
        case "mediaType":
          this._entriesFilters.removeMediaTypes(tag.value);
          break;
        case "freetext":
          this._entriesFilters.setFreeText(null);
          break;
        case "createdAt":
            this._entriesFilters.setCreatedAt({ createdAfter: null, createdBefore: null});
            break;
    }
  }

  removeAllTags() {
    this.clearSelection();
    this._entriesStore.clearAllFilters();
  }

  onFreetextChanged(): void {
    this._entriesFilters.setFreeText(this._filter.freetextSearch);
  }

  onSortChanged(event) {
    this.clearSelection();
    this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
    this._filter.sortBy = event.field;

    this._entriesStore.reload({
      sortBy: this._filter.sortBy,
      sortDirection: this._filter.sortDirection
    });
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageIndex = state.page;
      this._filter.pageSize = state.rows;

      this.clearSelection();
      this._entriesStore.reload({
        pageIndex: this._filter.pageIndex + 1,
        pageSize: this._filter.pageSize
      });
    }
  }

  ngOnInit() {


    const queryData = this._entriesStore.queryData;

    if (queryData) {
      this._filter.pageSize = queryData.pageSize;
      this._filter.pageIndex = queryData.pageIndex - 1;
      this._filter.sortBy = queryData.sortBy;
      this._filter.sortDirection = queryData.sortDirection;
    }

    // TODO sakal subscribe async
    this._entriesFilters.filters$
        .cancelOnDestroy(this)
        .subscribe(filters =>
        {
          this._filter.freetextSearch = filters.freetext;

          this._syncFiltersList(filters);
        });

    this.querySubscription = this._entriesStore.query$.subscribe(
      query => {

        this._filter.pageSize = query.data.pageSize;
        this._filter.pageIndex = query.data.pageIndex - 1;
        this._browserService.scrollToTop();
      }
    );

    this._entriesStore.reload(false);
  }

  private _syncFiltersList(filters : EntriesFilters) : void{

      const previousFilters = this._handledFiltersInTags;
      const existingFilterTags = [...this._filterTags];

      if ((!previousFilters || previousFilters.createdAt !== filters.createdAt))
      {
          existingFilterTags.splice(
              existingFilterTags.findIndex(item => item.type === 'createdAt'),
              1);

        if (filters.createdAt)
        {
            const { createdAfter, createdBefore } = filters.createdAt;
            let tooltip = '';
            if (createdAfter && createdBefore) {
                tooltip = `${moment(createdAfter).format('LL')} - ${moment(createdBefore).format('LL')}`;
            } else if (createdAfter) {
                tooltip = `From ${moment(createdAfter).format('LL')}`;
            } else if (createdBefore) {
                tooltip = `Until ${moment(createdBefore).format('LL')}`;
            }
            // TODO sakal fix tooltip as token
            existingFilterTags.push({ type : 'createdAt', label : 'Dates' , tooltip : {token: tooltip}});
        }
      }

      if ((!previousFilters || previousFilters.freetext !== filters.freetext))
      {
          existingFilterTags.splice(
              existingFilterTags.findIndex(item => item.type === 'freetext'),
              1);

          if (filters.freetext)
          {
              existingFilterTags.push({ type : 'freetext', value : filters.freetext, label : filters.freetext, tooltip : {token: `applications.content.filters.freeText`}});
          }
      }

      // if (!previousFilters || previousFilters.mediaTypes !== filters.mediaTypes) {
      //     const existingMediaTypes = existingFilterTags.filter(filter => filter.type === 'mediaType');
      //     const newMediaTypes = Object.entries(filters.mediaTypes).map(([value, label]) =>
      //         ({
      //         type: 'mediaType',
      //         value: value,
      //         label,
      //         tooltip : { token: 'tooltip' }
      //
      //     }));
      //
      //     const delta = getDelta(existingMediaTypes,newMediaTypes, 'value', (a,b) => a.value === b.value);
      //
      //     existingFilterTags.push(...delta.added);
      //
      //     delta.deleted.forEach(removedMediaType =>
      //     {
      //         existingFilterTags.splice(
      //             existingFilterTags.findIndex(item => item.value === removedMediaType.value),
      //             1);
      //
      //     });
      // }

      this._handledFiltersInTags = filters;
      this._filterTags = existingFilterTags;
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.querySubscription = null;
  }

  public _reload() {
    this.clearSelection();
    this._entriesStore.reload(true);
  }

  clearSelection() {
    this.selectedEntries = [];
  }

  onSelectedEntriesChange(event): void {
    this.selectedEntries = event;
  }

    onTagsChange(event){
        this.tags.updateLayout();
    }


    onBulkChange(event): void {
    if (event.reload === true) {
      this._reload();
    }
  }

}

