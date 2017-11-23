import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Self, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';

import { EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import {
    EntriesFiltersService,
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'kEntriesList',
  templateUrl: './entries-list.component.html',
  styleUrls: ['./entries-list.component.scss'],
    providers: [EntriesFiltersService]

})
export class EntriesListComponent implements OnInit, OnDestroy {
  @Input() showReload = true;
  @Input() isBusy = false;
  @Input() blockerMessage: AreaBlockerMessage = null;
  @Input() selectedEntries: any[] = [];
  @Input() columns: EntriesTableColumns | null;
  @Input() rowActions: { label: string, commandName: string }[];

  @ViewChild('tags') private tags: StickyComponent;

  @Output() onActionsSelected = new EventEmitter<{ action: string, entryId: string }>();
  public _filterTags : { type : string, value : any, label : string, tooltip : {token : string, args?: any}}[] = [];


    private querySubscription: ISubscription;

    // TODO sakal add type
  public _query = {
      freetext:'',
      createdAfter :null,
      createdBefore: null,
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(private _entriesStore: EntriesStore,
              private _store: EntriesFiltersStore,
              private appLocalization: AppLocalization,
              private router: Router,
              private _browserService: BrowserService) {
  }

  removeTag(tag: any) {
      this.clearSelection();

      switch (tag.type) {
          case "mediaType":
              const previousData = this._store.getFilterData('mediaTypes');

              previousData.splice(
                  previousData.findIndex(item => item.value === tag.value)
                  , 1
              );

              this._store.update({
                  mediaTypes: previousData
              });
              break;
          case "freetext":
              this._store.update({freetext: null});
              break;
          case "createdAt":
              this._store.update({createdAt: {createdAfter: null, createdBefore: null}});
              break;
      }
  }

  removeAllTags() {
    this.clearSelection();
    this._entriesStore.clearAllFilters();
  }

  onFreetextChanged(): void {
    this._store.update({ freetext: this._query.freetext});
  }

  onSortChanged(event) {
    this.clearSelection();
    this._query.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
    this._query.sortBy = event.field;

    this._entriesStore.reload({
      sortBy: this._query.sortBy,
      sortDirection: this._query.sortDirection
    });
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._query.pageIndex = state.page;
      this._query.pageSize = state.rows;

      this.clearSelection();
      this._entriesStore.reload({
        pageIndex: this._query.pageIndex + 1,
        pageSize: this._query.pageSize
      });
    }
  }

  ngOnInit() {
      this._query.freetext = this._store.getFilterData('freetext');

      this._store.dataChanges$
          .cancelOnDestroy(this)
          .subscribe(changes => {
              if (typeof changes.createdAt !== 'undefined') {
                  this._syncTagOfCreatedAt();
              }

              if (typeof changes.mediaTypes !== 'undefined') {
                  this._syncTagsOfMediaTypes();
              }

              if (typeof changes.freetext !== 'undefined') {
                  this._syncTagOfFreetext();
                  this._query.freetext = changes.freetext.currentValue;
              }
          });

    const queryData = this._entriesStore.queryData;

    if (queryData) {
      this._query.pageSize = queryData.pageSize;
      this._query.pageIndex = queryData.pageIndex - 1;
      this._query.sortBy = queryData.sortBy;
      this._query.sortDirection = queryData.sortDirection;
    }

    this.querySubscription = this._entriesStore.query$.subscribe(
      query => {

        this._query.pageSize = query.data.pageSize;
        this._query.pageIndex = query.data.pageIndex - 1;
        this._browserService.scrollToTop();
      }
    );

    this._entriesStore.reload(false);
  }

    private _syncTagOfCreatedAt(): void {
        this._filterTags.splice(
            this._filterTags.findIndex(item => item.type === 'createdAt'),
            1);

        const {createdAfter, createdBefore} = this._store.getFilterData('createdAt')|| { createdAfter: null, createdBefore: null};
        if (createdAfter || createdBefore) {
            let tooltip = '';
            if (createdAfter && createdBefore) {
                tooltip = `${moment(createdAfter).format('LL')} - ${moment(createdBefore).format('LL')}`;
            } else if (createdAfter) {
                tooltip = `From ${moment(createdAfter).format('LL')}`;
            } else if (createdBefore) {
                tooltip = `Until ${moment(createdBefore).format('LL')}`;
            }
            // TODO sakal fix tooltip as token
            this._filterTags.push({type: 'createdAt', value: null, label: 'Dates', tooltip: {token: tooltip}});
        }
    }

  private _syncTagOfFreetext(): void {
      this._filterTags.splice(
          this._filterTags.findIndex(item => item.type === 'freetext'),
          1);

      const currentFreetextValue = this._store.getFilterData('freetext');

      if (currentFreetextValue) {
          this._filterTags.push({
              type: 'freetext',
              value: currentFreetextValue,
              label: currentFreetextValue,
              tooltip: {token: `applications.content.filters.freeText`}
          });
      }
  }
  private _syncTagsOfMediaTypes(): void {

      const currentValue =  this._store.getFilterData('mediaTypes');
      const tagsFilters = this._filterTags.filter(item => item.type === 'mediaType');

      const diff = this._store.getDiff(tagsFilters, 'value', currentValue, 'value');

      diff.deleted.forEach(item => {
          this._filterTags.splice(
              this._filterTags.indexOf(item),
              1);
      });

      // TODO sakal remove explicit types
      diff.added.forEach(item => {
          this._filterTags.push({
              type: 'mediaType',
              value: (<any>item).value,
              label: (<any>item).label,
              tooltip: {token: 'applications.content.filters.mediaType', args: {'0': (<any>item).label}}
          });
      });
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

