import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Self, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';

import { EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import {
    EntriesFilters,
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';

import * as moment from 'moment';

@Component({
  selector: 'kEntriesList',
  templateUrl: './entries-list.component.html',
  styleUrls: ['./entries-list.component.scss']

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

  constructor(private _entriesFilters: EntriesFiltersStore,
              private _entriesStore: EntriesStore,
              private _browserService: BrowserService) {
  }

  removeTag(tag: any) {
      this.clearSelection();

      switch (tag.type) {
          case "mediaType":
              const previousData = this._entriesFilters.cloneFilter('mediaTypes', []);

              previousData.splice(
                  previousData.findIndex(item => item.value === tag.value)
                  , 1
              );

              this._entriesFilters.update({
                  mediaTypes: previousData
              });
              break;
          case "freetext":
              this._entriesFilters.update({freetext: null});
              break;
          case "createdAt":
              this._entriesFilters.update({createdAt: {fromDate: null, toDate: null}});
              break;
      }
  }

  removeAllTags() {
      // TODO sakal not working
    this.clearSelection();

  }

  onFreetextChanged(): void {
    this._entriesFilters.update({ freetext: this._query.freetext});
  }

  onSortChanged(event) {
    this.clearSelection();

      // TODO sakal - should make sure this function is implemented the same in other views

    this._entriesFilters.update({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {

        // TODO sakal - should make sure this function is implemented the same in other views

      this.clearSelection();
      this._entriesFilters.update({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  ngOnInit() {
      this._restoreFiltersState();
      this._registerToFilterStoreDataChanges();
  }

  private _restoreFiltersState(): void
  {
      this._updateComponentState(this._entriesFilters.cloneFilters(
          [
              'freetext',
              'pageSize',
              'pageIndex',
              'sortBy',
              'sortDirection'
          ]
      ));
  }

    private _updateComponentState(updates: Partial<EntriesFilters>): void {
      if (typeof updates.freetext !== 'undefined') {
          this._query.freetext = updates.freetext || '';
      }

        if (typeof updates.pageSize !== 'undefined') {
            this._query.pageSize = updates.pageSize;

        }

        if (typeof updates.pageIndex !== 'undefined') {
            this._query.pageIndex = updates.pageIndex;
        }

        if (typeof updates.sortBy !== 'undefined') {
            this._query.sortBy = updates.sortBy;
        }

        if (typeof updates.sortDirection !== 'undefined') {
            this._query.sortDirection = updates.sortDirection;
        }

        // if (typeof changes.createdAt !== 'undefined') {
        //     this._syncTagOfCreatedAt();
        // }
        //
        // if (typeof changes.mediaTypes !== 'undefined') {
        //     this._syncTagsOfMediaTypes();
        // }
        //
        // if (typeof changes.freetext !== 'undefined') {
        //     this._syncTagOfFreetext();
        //     this._query.freetext = changes.freetext.currentValue;
        // }
    }

    private _registerToFilterStoreDataChanges(): void {
        this._entriesFilters.dataChanges$
            .cancelOnDestroy(this)
            .subscribe(changes => {
                const changesFlat: Partial<EntriesFilters> = Object.keys(changes).reduce(
                    (acc, propertyName) => {
                        acc[propertyName] = changes[propertyName].currentValue;
                        return acc;
                    }, {});
                this._updateComponentState(changesFlat);
                this._browserService.scrollToTop();
            });
    }

    private _syncTagOfCreatedAt(): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'createdAt');
        if (previousItem !== -1) {
            this._filterTags.splice(
                previousItem,
                1);
        }

        const {fromDate, toDate} = this._entriesFilters.cloneFilter('createdAt', { fromDate: null, toDate: null});
        if (fromDate || toDate) {
            let tooltip = '';
            if (fromDate && toDate) {
                tooltip = `${moment(fromDate).format('LL')} - ${moment(toDate).format('LL')}`;
            } else if (fromDate) {
                tooltip = `From ${moment(fromDate).format('LL')}`;
            } else if (toDate) {
                tooltip = `Until ${moment(toDate).format('LL')}`;
            }
            // TODO sakal fix tooltip as token
            this._filterTags.push({type: 'createdAt', value: null, label: 'Dates', tooltip: {token: tooltip}});
        }
    }

  private _syncTagOfFreetext(): void {
      const previousItem = this._filterTags.findIndex(item => item.type === 'freetext');
      if (previousItem !== -1) {
          this._filterTags.splice(
              previousItem,
              1);
      }

      const currentFreetextValue = this._entriesFilters.cloneFilter('freetext', null);

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

      const currentValue =  this._entriesFilters.cloneFilter('mediaTypes', []);
      const tagsFilters = this._filterTags.filter(item => item.type === 'mediaType');

      const tagsFiltersMap = this._entriesFilters.toMap(tagsFilters, 'value');
      const currentValueMap = this._entriesFilters.toMap(currentValue, 'value');
      const diff = this._entriesFilters.getDiff(tagsFiltersMap, currentValueMap);

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
    this._entriesStore.reload();
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

