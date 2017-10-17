import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { DropFoldersService } from './drop-folders.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell';
import { DropFoldersListTableComponent } from './drop-folders-list-table.component';
import * as moment from 'moment';

export interface Filter {
  type: string;
  label: string;
  tooltip: string
}

@Component({
  selector: 'kDropFoldersList',
  templateUrl: './drop-folders-list.component.html',
  styleUrls: ['./drop-folders-list.component.scss']
})

export class DropFoldersListComponent implements OnInit, OnDestroy {
  @ViewChild(DropFoldersListTableComponent) private dataTable: DropFoldersListTableComponent;

  _isBusy = false;
  _blockerMessage: AreaBlockerMessage = null;
  _selectedDropFolders: any[] = [];

  _filter = {
    pageIndex : 0,
    fileNameLike : '',
    createdBefore: null,
    createdAfter: null,
    pageSize : null // pageSize is set to null by design. It will be modified after the first time loading drop folders
  };

  activeFilters: Filter[] = [];

  constructor(
    public _dropFoldersService: DropFoldersService,
    private _appLocalization: AppLocalization,
    private _router: Router,
    private _browserService: BrowserService
  ) {}

  _bulkDelete(): void {
    console.log('bulk delete');
  }

  _clearSelection(): void {
    this._selectedDropFolders = [];
  }

  onFreetextChanged() : void {
    this._dropFoldersService.reload({ freeText: this._filter.fileNameLike });
  }

  _reload() {
    this._clearSelection();
    this._dropFoldersService.reload(true);
  }

  onCreatedChanged(dates) : void {
    this._dropFoldersService.reload({
      createdAfter: dates.createdAfter,
      createdBefore: dates.createdBefore,
      pageIndex: 1
    });

    if(!dates.createdAfter && !dates.createdBefore) {
      this.clearDates();
    }
  }

  clearDates() {
    this.activeFilters.forEach((el, index, arr) => {
      if(el.type == 'Dates') {
        arr.splice(index, 1);
      }
    });
  }

  updateFilters(filter: Filter, flag?: number) { // if flag == 1 we won't push filter to activeFilters
    if(!filter.label) {
      flag = 1;
    }
    this.activeFilters.forEach((el, index, arr) => {
      if(el.type == filter.type) {
        arr.splice(index, 1);
      }
    });
    if(!flag) {
      this.activeFilters.push(filter);
    }
  }

  removeAllTags(){
    this._clearSelection();
    this._dropFoldersService.reload({
      freeText: '',
      createdBefore: null,
      createdAfter: null,
      pageIndex: 1
    });
    this.activeFilters = [];
  }

  removeTag(tag: Filter){
    this.updateFilters(tag, 1);
    if(tag.type === 'freeText') {
      this._filter.fileNameLike = null;
    }
    if(tag.type === 'Dates') {
      this._filter.createdBefore = null;
      this._filter.createdAfter = null;
    }
    this._dropFoldersService.reload({
      freeText: this._filter.fileNameLike,
      createdBefore: this._filter.createdBefore,
      createdAfter: this._filter.createdAfter,
      pageIndex: 1
    });
  }

  _selectedDropFoldersChange(event): void {
    this._selectedDropFolders = event;
  }

  goToEntry(entryId: KalturaMediaEntry): void {
    this._router.navigate(['/content/entries/entry', entryId]);
  }

  checkIfEntryExist(event): void {
    this._isBusy = true;
    this._dropFoldersService._isEntryExist(event.entryId)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._isBusy = false;
          this.goToEntry(event.entryId);
        },
        error => {
          this._isBusy = false;
          this._browserService.alert({
            message: error.message
          })
        }
      );
  }

  deleteDropFolder(id): void {
    console.log(id);
  }

  onPaginationChanged(state : any) : void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageSize = state.page + 1;
      this._filter.pageIndex = state.rows;
      this._dropFoldersService.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
      this._clearSelection();
    }
  }

  syncFilters(query) {
    let freeTextFilter: Filter = {
      type: 'freeText',
      label: query.freeText,
      tooltip: this._appLocalization.get('applications.content.filters.freeText')
    };
    this.updateFilters(freeTextFilter);

    let dateFilter: Filter = {
      type: 'Dates',
      label: freeTextFilter.type,
      tooltip: null
    };

    if (query.createdAfter || query.createdBefore) {
      dateFilter.type = 'Dates';
      dateFilter.label = dateFilter.type;
      if (!query.createdAfter) {
        dateFilter.tooltip = this._appLocalization.get('applications.content.filters.dateFilter.until', {0: moment(query.createdBefore).format('LL')});
      } else if (!query.createdBefore) {
        dateFilter.tooltip = this._appLocalization.get('applications.content.filters.dateFilter.from', {0: moment(query.createdAfter).format('LL')});
      } else {
        dateFilter.tooltip = `${moment(query.createdAfter).format('LL')} - ${moment(query.createdBefore).format('LL')}`;
      }
      this.updateFilters(dateFilter);
    }
  }

  ngOnInit() {
    this._dropFoldersService.query$
      .cancelOnDestroy(this)
      .subscribe(
        query => {
          this._filter.pageSize = query.pageSize;
          this._filter.pageIndex = query.pageIndex - 1;
          this._filter.fileNameLike = query.freeText;
          this._filter.createdAfter = query.createdAfter;
          this._filter.createdBefore = query.createdBefore;

          this.syncFilters(query);

          this.dataTable.scrollToTop();
        }
      );

    this._dropFoldersService.state$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._isBusy = false;
          if (response.errorMessage) {
            this._blockerMessage = new AreaBlockerMessage({
              message: response.errorMessage,
              buttons: [{
                label: this._appLocalization.get('applications.content.dropFolders.errors.retry'),
                action: () => {
                  this._dropFoldersService.reload(true);
                }
              }]
            });
          } else {
            this._blockerMessage = null;
            this._isBusy = false;
          }
        },
        error => {
          console.warn('[kmcng] -> could not load user roles'); // navigate to error page
          throw error;
        });

    this._dropFoldersService.reload(true);
  }

  ngOnDestroy() {}
}
