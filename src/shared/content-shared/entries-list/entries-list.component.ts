import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';

import { EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import {
    EntriesFilters,
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';

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

    // TODO sakal add type
    public _query = {
        freetext: '',
        createdAfter: null,
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

    ngOnInit() {
        this._restoreFiltersState();
        this._registerToFilterStoreDataChanges();
    }

    private _restoreFiltersState(): void {
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

        if (typeof updates.createdAt !== 'undefined') {
        }

        if (typeof updates.freetext !== 'undefined') {
            this._query.freetext = updates.freetext;
        }
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

    onFreetextChanged(): void {
        this._entriesFilters.update({freetext: this._query.freetext});
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


    ngOnDestroy() {
    }

    public _reload() {
        this.clearSelection();
        this._entriesStore.reload();
    }

    clearSelection() {
        this.selectedEntries = [];
    }

    onTagsChange() {
        this.tags.updateLayout();
    }


    onBulkChange(event): void {
        if (event.reload === true) {
            this._reload();
        }
    }
}

