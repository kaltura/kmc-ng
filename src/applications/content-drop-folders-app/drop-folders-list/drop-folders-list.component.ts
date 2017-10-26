import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { DropFoldersService } from './drop-folders.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { DropFoldersListTableComponent } from './drop-folders-list-table.component';
import { BulkDeleteService } from './bulk-service/bulk-delete.service';
import { KalturaDropFolderFile } from 'kaltura-typescript-client/types/KalturaDropFolderFile';
import { FolderFileStatusPipe } from './pipes/folder-file-status.pipe';
import { StatusesFilterComponent } from './statuses-filter/statuses-filter.component';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import * as moment from 'moment';

export interface Filter {
  type: string;
  label: string;
  tooltip: string
}

@Component({
  selector: 'kDropFoldersList',
  templateUrl: './drop-folders-list.component.html',
  styleUrls: ['./drop-folders-list.component.scss'],
  providers: [BulkDeleteService, FolderFileStatusPipe]
})

export class DropFoldersListComponent implements OnInit, OnDestroy {
  @ViewChild(DropFoldersListTableComponent) private dataTable: DropFoldersListTableComponent;
  @ViewChild('statusFilter') private statusFilter: StatusesFilterComponent;
  @ViewChild('statusesFilterPopup') public statusesFilterPopup: PopupWidgetComponent;

  _isBusy = false;
  _blockerMessage: AreaBlockerMessage = null;
  _selectedDropFolders: any[] = [];

  _filter = {
    pageIndex : 0,
    fileNameLike : '',
    createdBefore: null,
    createdAfter: null,
    statuses: null,
    pageSize : null // pageSize is set to null by design. It will be modified after the first time loading drop folders
  };

  activeFilters: Filter[] = [];
  statusFilters: string[] = [];

  constructor(
    public _dropFoldersService: DropFoldersService,
    private _appLocalization: AppLocalization,
    private _router: Router,
    private _browserService: BrowserService,
    public _bulkDeleteService : BulkDeleteService,
    private _statusPipe: FolderFileStatusPipe
  ) {}

  _bulkDelete(_selectedDropFolders: KalturaDropFolderFile[]): void {
    let dropFolderFilesToDelete = _selectedDropFolders.map((file, index) => `${index + 1}: ${(file.fileName)}`),
        dropFolderFiles: string = _selectedDropFolders.length <= 10 ? dropFolderFilesToDelete.join(',').replace(/,/gi, '\n') : '';
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.dropFolders.deleteFiles'),
        message: this._appLocalization.get('applications.content.dropFolders.confirmDelete', {0: dropFolderFiles}),
        accept: () => {
          setTimeout(()=> {
            this.deleteDropFiles(_selectedDropFolders.map(file => file.id));
          }, 0);
        }
      }
    );
  }

  _clearSelection(): void {
    this._selectedDropFolders = [];
  }

  onFreetextChanged() : void {
    this._dropFoldersService.reload({ freeText: this._filter.fileNameLike });
  }

  _reload(): void {
    this._clearSelection();
    this._dropFoldersService.reload(true);
  }

  onCreatedChanged(dates) : void {
    this._dropFoldersService.reload({
      createdAfter: dates.createdAfter,
      createdBefore: dates.createdBefore,
      pageIndex: 1
    });

    if (!dates.createdAfter && !dates.createdBefore) {
      this.clearDates();
    }
  }

  _onTreeNodeSelected(node:any): void {
    let filters = this.statusFilters;
    if(node.node.children) {
      if(!filters.length) {
        node.node.children.filter(el => filters.push(el.data));
      } else {
        let nodes = node.node.children.map(el => el.data);
        nodes.forEach(node => {
          if(!filters.includes(node)) {
            filters.push(node);
          }
        });
      }
    } else {
      filters.push(node.node.data);
    }
    this._dropFoldersService.reload({ statuses: filters});
  }

  _onTreeNodeUnselected(node:any): void {
    let filters = this.statusFilters;
    node.node.children ? node.node.children.filter(el => filters.splice(filters.indexOf(el.data),1)) : filters.splice(filters.indexOf(node.node.data),1);
    this._dropFoldersService.reload({ statuses: filters});
  }

  clearDates(): void {
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

  removeAllTags(): void {
    this._clearSelection();
    this._dropFoldersService.reload({
      freeText: '',
      createdBefore: null,
      createdAfter: null,
      pageIndex: 1,
      statuses: null
    });
    this.activeFilters = [];
    this.statusFilter.resetFilters();
  }

  removeTag(tag: Filter): void {
    this.updateFilters(tag, 1);
    if(tag.type === 'freeText') {
      this._filter.fileNameLike = null;
    }
    if(tag.type === 'Dates') {
      this._filter.createdBefore = null;
      this._filter.createdAfter = null;
    }
    this.activeFilters.filter((filter, index, arr) => {
      if(filter.type === tag.type) {
        arr.splice(index, 1);
      }
    });
    this.statusFilters.filter((status, index, arr) => {
      if(status === tag.type) {
        arr.splice(index, 1);
      }
    });
    this.statusFilter.removeFilter(tag.type);
    this._dropFoldersService.reload({
      freeText: this._filter.fileNameLike,
      createdBefore: this._filter.createdBefore,
      createdAfter: this._filter.createdAfter,
      statuses: this.statusFilters,
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

  deleteDropFolderFiles(event): void {
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.dropFolders.deleteFiles'),
        message: this._appLocalization.get('applications.content.dropFolders.confirmDelete', {0: event.name ? event.name : event.fileName}),
        accept: () => {
          this.deleteDropFiles([event.id]);
        }
      }
    );
  }

  private deleteDropFiles(ids:number[]): void {
    this._isBusy = false;
    const execute = () => {
      this._bulkDeleteService.deleteDropFiles(ids)
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            this._isBusy = false;
            this._dropFoldersService.reload(true);
            this._clearSelection();
          },
          error => {
            this._blockerMessage = new AreaBlockerMessage({
              message: this._appLocalization.get('applications.content.dropFolders.errors.errorDropFoldersFiles'),
              buttons: [{
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this._blockerMessage = null;
                  this._isBusy = false;
                }
              }]
            });
          }
        );
    };

    if(ids.length > environment.modules.contentEntries.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirmDropFolders', {"0": ids.length}),
          accept: () => {
            execute();
          }
        }
      );
    } else{
      execute();
    }
  }

  onPaginationChanged(state : any): void {
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


    for (let i = this.activeFilters.length - 1; i >= 0; i--) {
      if(this.activeFilters[i].type !== 'freeText' && this.activeFilters[i].type !== 'Dates') {
        this.activeFilters.splice(i, 1);
      }
    }

    if(query.statuses) {
      query.statuses.forEach(status => {
        let statusName = this._statusPipe.transform(status, false, false),
          statusTooltip = this._statusPipe.transform(status, false, true);
        this.updateFilters({
          type: status,
          label: statusName,
          tooltip: statusTooltip
        });
      });
    } else {
      this.statusFilters = [];
    }

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

  close(): void {
    this.statusesFilterPopup.close();
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
          this._filter.statuses = query.statuses;

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
