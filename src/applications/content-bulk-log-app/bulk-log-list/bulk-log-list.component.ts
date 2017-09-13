import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

import { SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableComponent } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';

@Component({
  selector: 'kBulkLogList',
  templateUrl: './bulk-log-list.component.html',
  styleUrls: ['./bulk-log-list.component.scss']
})
export class BulkLogListComponent implements OnInit, OnDestroy {
  @Input() selectedBulkLogItems: Array<any> = [];
  @ViewChild(EntriesTableComponent) private dataTable: EntriesTableComponent;

  public isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  private querySubscription: ISubscription;

  public _filter = {
    pageIndex: 0,
    freetextSearch: '',
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(private _appLocalization: AppLocalization,
              private _router: Router,
              private _browserService: BrowserService,
              public _store: BulkLogStoreService) {
  }

  removeTag(tag: any) {
    this.clearSelection();
  }

  removeAllTags() {
    this.clearSelection();
  }

  onFreetextChanged(): void {

    if (this._filter.freetextSearch) {
    }
  }

  onSortChanged(event) {
    this.clearSelection();
    this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
    this._filter.sortBy = event.field;
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageIndex = state.page;
      this._filter.pageSize = state.rows;

      this.clearSelection();
    }
  }

  ngOnInit() {
    this._store.reload(true);
    this._store.bulkLog$.subscribe(res => {
      console.log(res);
    })
  }

  ngOnDestroy() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.querySubscription = null;
    }
  }

  public _reload() {
    this.clearSelection();
  }

  private syncFreetextComponents() {
  }

  onActionSelected(event) {
    switch (event.action) {
      case 'view':
        this._router.navigate(['/content/entries/entry', event.entryID]);
        break;
      case 'delete':
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.content.entries.deleteEntry'),
            message: this._appLocalization.get('applications.content.entries.confirmDeleteSingle', { 0: event.entryID }),
            accept: () => {
              this.deleteEntry(event.entryID);
            }
          }
        );
        break;
      default:
        break;
    }
  }

  private deleteEntry(entryId: string): void {
    this.isBusy = true;
    this._blockerMessage = null;
  }

  clearSelection() {
    this.selectedBulkLogItems = [];
  }

  onSelectedEntriesChange(event): void {
    this.selectedBulkLogItems = event;
  }

  onBulkChange(event): void {
    if (event.reload === true) {
      this._reload();
    }
  }

}

