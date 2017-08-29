import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { EntriesStore, SortDirection } from '../../../content-entries-app/entries/entries-store/entries-store.service';
import { FreetextFilter } from '../../../content-entries-app/entries/entries-store/filters/freetext-filter';
import { EntriesTableComponent } from './entries-table.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kAddEntry',
  templateUrl: './playlist-add-entry.component.html',
  styleUrls: ['./playlist-add-entry.component.scss']
})
export class PlaylistAddEntryComponent implements  OnInit, AfterViewInit, OnDestroy {

  @ViewChild(EntriesTableComponent) private dataTable: EntriesTableComponent;
  @ViewChild('categoriesFilterPopup') public categoriesFilterPopup: PopupWidgetComponent;
  @Output() onClosePopupWidget = new EventEmitter<any>();

  public isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  public _filter = {
    pageIndex : 0,
    freetextSearch : '',
    pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy : 'createdAt',
    sortDirection : SortDirection.Desc
  };

  private querySubscription : ISubscription;
  public _selectedEntries: any[] = [];
  public entries: any[] = [];

  constructor(
    public _entriesStore : EntriesStore,
    private appLocalization: AppLocalization,
    private router: Router,
    private _browserService : BrowserService
  ) {}

  closePopupWidget() {
    this.onClosePopupWidget.emit();
  }

  private syncFreetextComponents()
  {
    const freetextFilter = this._entriesStore.getFirstFilterByType(FreetextFilter);

    if (freetextFilter)
    {
      this._filter.freetextSearch = freetextFilter.value;
    }else
    {
      this._filter.freetextSearch = null;
    }
  }

  onSortChanged(event) {
    this.clearSelection();
    this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
    this._filter.sortBy = event.field;

    this._entriesStore.reload({
      sortBy : this._filter.sortBy,
      sortDirection : this._filter.sortDirection
    });
  }

  onActionSelected(event){
    switch (event.action){
      case "view":
        this.router.navigate(['/content/entries/entry', event.entryID]);
        break;
      case "delete":
        this._browserService.confirm(
          {
            header: this.appLocalization.get('applications.content.entries.deleteEntry'),
            message: this.appLocalization.get('applications.content.entries.confirmDeleteSingle', { 0: event.entryID }),
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

  private deleteEntry(entryId: string): void{
    this.isBusy = true;
    this._blockerMessage = null;
    this._entriesStore.deleteEntry(entryId).subscribe(
      () => {
        this.isBusy = false;
        this._browserService.showGrowlMessage({severity: 'success', detail: this.appLocalization.get('applications.content.entries.deleted')});
        this._entriesStore.reload(true);
      },
      error => {
        this.isBusy = false;

        this._blockerMessage = new AreaBlockerMessage(
          {
            message: error.message,
            buttons: [
              {
                label: this.appLocalization.get('app.common.retry'),
                action: () => {
                  this.deleteEntry(entryId);
                }
              },
              {
                label: this.appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          }
        )
      }
    );
  }

  clearSelection(){
    this._selectedEntries = [];
  }

  onPaginationChanged(state : any) : void {
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

  onFreetextChanged() : void{
    this._entriesStore.removeFiltersByType(FreetextFilter);
    if (this._filter.freetextSearch) {
      this._entriesStore.addFilters(new FreetextFilter(this._filter.freetextSearch));
    }
  }

  openCategories() {
    // this.categoriesFilterPopup.open();
  }

  showSelectedOnly(checked: boolean) {
    if(checked) {
      this.entries = this._selectedEntries;
    }
  }

  ngOnInit(){
    this._entriesStore.entries$
      .subscribe(
        response => {
          this.entries = response.items;
        }
      );

    const query = this._entriesStore.queryData;

    if (query) {
      this.syncFreetextComponents();
      this._filter.pageSize = query.pageSize;
      this._filter.pageIndex = query.pageIndex - 1;
      this._filter.sortBy = query.sortBy;
      this._filter.sortDirection = query.sortDirection;
    }


    this.querySubscription = this._entriesStore.query$.subscribe(
      query => {
        this.syncFreetextComponents();

        this._filter.pageSize = query.data.pageSize;
        this._filter.pageIndex = query.data.pageIndex-1;
        this.dataTable.scrollToTop();
      }
    );

    this._entriesStore.reload(false);
  }

  ngAfterViewInit(){}

  ngOnDestroy(){
    this.querySubscription.unsubscribe();
    this.querySubscription = null;
  }
}

