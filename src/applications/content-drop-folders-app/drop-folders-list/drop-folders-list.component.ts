import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';
import { DropFoldersService } from './drop-folders.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { BulkDeleteService } from './bulk-service/bulk-delete.service';
import { FolderFileStatusPipe } from './pipes/folder-file-status.pipe';
import { StatusesFilterComponent } from './statuses-filter/statuses-filter.component';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import * as moment from 'moment';
import { KalturaDropFolderFile } from 'kaltura-ngx-client/api/types/KalturaDropFolderFile';

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
  @ViewChild(PopupWidgetComponent) private _statusesFilterPopup: PopupWidgetComponent;
  @ViewChild(StatusesFilterComponent) private _statusFilter: StatusesFilterComponent;
  @ViewChild('tags') private _tags: StickyComponent;

  private _statusFilters: string[] = [];

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedDropFolders: KalturaDropFolderFile[] = [];
  public _activeFilters: Filter[] = [];
  public _filter = {
    pageIndex: 0,
    fileNameLike: '',
    createdBefore: null,
    createdAfter: null,
    statuses: null,
    pageSize: null // pageSize is set to null by design. It will be modified after the first time loading drop folders
  };

  constructor(public _dropFoldersService: DropFoldersService,
              public _bulkDeleteService: BulkDeleteService,
              private _appLocalization: AppLocalization,
              private _router: Router,
              private _browserService: BrowserService,
              private _statusPipe: FolderFileStatusPipe) {
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

          this._syncFilters(query);
          this._browserService.scrollToTop();
        }
      );

    this._dropFoldersService.dropFolders.state$
      .cancelOnDestroy(this)
      .subscribe(
        status => {
          if (status.error) {
            this._blockerMessage = new AreaBlockerMessage({
              message: status.error,
              buttons: [{
                label: this._appLocalization.get('applications.content.dropFolders.errors.retry'),
                action: () => {
                  this._dropFoldersService.reload(true);
                }
              }]
            });
          } else {
            this._blockerMessage = null;
          }
        },
        error => {
          console.warn('[kmcng] -> could not load user roles'); // navigate to error page
          throw error;
        });

    this._dropFoldersService.reload(true);
  }

  ngOnDestroy() {
  }

  private _syncFilters(query) {
    const freeTextFilter: Filter = {
      type: 'freeText',
      label: query.freeText,
      tooltip: this._appLocalization.get('applications.content.filters.freeText')
    };
    this._updateFilters(freeTextFilter);


    for (let i = this._activeFilters.length - 1; i >= 0; i--) {
      if (this._activeFilters[i].type !== 'freeText' && this._activeFilters[i].type !== 'Dates') {
        this._activeFilters.splice(i, 1);
      }
    }

    if (query.statuses) {
      query.statuses.forEach(status => {
        const statusName = this._statusPipe.transform(status, false, false);
        const statusTooltip = this._statusPipe.transform(status, false, true);
        this._updateFilters({
          type: status,
          label: statusName,
          tooltip: statusTooltip
        });
      });
    } else {
      this._statusFilters = [];
    }

    const dateFilter: Filter = {
      type: 'Dates',
      label: freeTextFilter.type,
      tooltip: null
    };

    if (query.createdAfter || query.createdBefore) {
      dateFilter.type = 'Dates';
      dateFilter.label = dateFilter.type;
      if (!query.createdAfter) {
        dateFilter.tooltip = this._appLocalization.get('applications.content.filters.dateFilter.until', {
          0: moment(query.createdBefore).format('LL')
        });
      } else if (!query.createdBefore) {
        dateFilter.tooltip = this._appLocalization.get('applications.content.filters.dateFilter.from', {
          0: moment(query.createdAfter).format('LL')
        });
      } else {
        dateFilter.tooltip = `${moment(query.createdAfter).format('LL')} - ${moment(query.createdBefore).format('LL')}`;
      }
      this._updateFilters(dateFilter);
    }
  }

  private _clearDates(): void {
    this._activeFilters.forEach((el, index, arr) => {
      if (el.type === 'Dates') {
        arr.splice(index, 1);
      }
    });
  }

  private _updateFilters(filter: Filter, updateActiveFilters?: boolean) {
    if (!filter.label) {
      updateActiveFilters = true;
    }
    this._activeFilters.forEach((el, index, arr) => {
      if (el.type === filter.type) {
        arr.splice(index, 1);
      }
    });
    if (!updateActiveFilters) { // if updateActiveFilters === true we won't push filter to activeFilters
      this._activeFilters.push(filter);
    }
  }

  private _deleteDropFiles(ids: number[]): void {
    const execute = () => {
      this._bulkDeleteService.deleteDropFiles(ids)
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(
          () => {
            this._dropFoldersService.reload(true);
            this._clearSelection();
          },
          error => {
            this._blockerMessage = new AreaBlockerMessage({
              message: this._appLocalization.get('applications.content.dropFolders.errors.errorDropFoldersFiles'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._blockerMessage = null;
                    this._deleteDropFiles(ids);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            })
          }
        );
    };

    if (ids.length > environment.modules.dropFolders.bulkActionsLimit) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.bulkActions.note'),
        message: this._appLocalization.get('applications.content.bulkActions.confirmDropFolders', { '0': ids.length }),
        accept: () => execute()
      });
    } else {
      execute();
    }
  }

  public _bulkDelete(_selectedDropFolders: KalturaDropFolderFile[]): void {
    const dropFolderFilesToDelete = _selectedDropFolders.map((file, index) => `${index + 1}: ${(file.fileName)}`);
    const dropFolderFiles = _selectedDropFolders.length <= 10 ? dropFolderFilesToDelete.join(',').replace(/,/gi, '\n') : '';
    this._browserService.confirm({
      header: this._appLocalization.get('applications.content.dropFolders.deleteFiles'),
      message: this._appLocalization.get('applications.content.dropFolders.confirmDelete', { 0: dropFolderFiles }),
      accept: () => {
        setTimeout(() => {
          this._deleteDropFiles(_selectedDropFolders.map(file => file.id));
        }, 0);
      }
    });
  }

  public _clearSelection(): void {
    this._selectedDropFolders = [];
  }

  public _onFreetextChanged(): void {
    this._dropFoldersService.reload({ freeText: this._filter.fileNameLike });
  }

  public _reload(): void {
    this._clearSelection();
    this._dropFoldersService.reload(true);
  }

  public _onCreatedChanged(dates): void {
    this._dropFoldersService.reload({
      createdAfter: dates.createdAfter,
      createdBefore: dates.createdBefore,
      pageIndex: 1
    });

    if (!dates.createdAfter && !dates.createdBefore) {
      this._clearDates();
    }
  }

  public _onTreeNodeSelected(node: any): void {
    const filters = this._statusFilters;
    if (node.node.children) {
      if (!filters.length) {
        node.node.children.filter(el => filters.push(el.data));
      } else {
        const nodes = node.node.children.map(el => el.data);
        nodes.forEach(item => {
          if (!filters.includes(item)) {
            filters.push(item);
          }
        });
      }
    } else {
      filters.push(node.node.data);
    }
    this._dropFoldersService.reload({ statuses: filters });
  }

  public _onTreeNodeUnselected(node: any): void {
    const filters = this._statusFilters;
    if (node.node.children) {
      node.node.children.filter(el => filters.splice(filters.indexOf(el.data), 1))
    } else {
      filters.splice(filters.indexOf(node.node.data), 1);
    }
    this._dropFoldersService.reload({ statuses: filters });
  }

  public _removeAllTags(): void {
    this._clearSelection();
    this._dropFoldersService.reload({
      freeText: '',
      createdBefore: null,
      createdAfter: null,
      pageIndex: 1,
      statuses: null
    });
    this._activeFilters = [];
    this._statusFilter.resetFilters();
  }

  public _removeTag(tag: Filter): void {
    this._updateFilters(tag, true);
    if (tag.type === 'freeText') {
      this._filter.fileNameLike = null;
    }
    if (tag.type === 'Dates') {
      this._filter.createdBefore = null;
      this._filter.createdAfter = null;
    }
    this._activeFilters.filter((filter, index, arr) => {
      if (filter.type === tag.type) {
        arr.splice(index, 1);
      }
    });
    this._statusFilters.filter((status, index, arr) => {
      if (status === tag.type) {
        arr.splice(index, 1);
      }
    });
    this._dropFoldersService.reload({
      freeText: this._filter.fileNameLike,
      createdBefore: this._filter.createdBefore,
      createdAfter: this._filter.createdAfter,
      statuses: this._statusFilters,
      pageIndex: 1
    });
  }

  public _navigateToEntry(entryId: string): void {
    this._dropFoldersService.isEntryExist(entryId)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        exists => {
          if (exists) {
            this._router.navigate(['/content/entries/entry', entryId]);
          }
        },
        ({ message }) => this._browserService.alert({ message })
      );
  }

  public _deleteDropFolderFiles(event): void {
    this._browserService.confirm({
      header: this._appLocalization.get('applications.content.dropFolders.deleteFiles'),
      message: this._appLocalization.get('applications.content.dropFolders.confirmDelete', {
        0: event.name ? event.name : event.fileName
      }),
      accept: () => this._deleteDropFiles([event.id])
    });
  }

  public _onPaginationChanged(state: any): void {
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

  public _close(): void {
    this._statusesFilterPopup.close();
  }

  public _onTagsChange(event) {
    this._tags.updateLayout();
  }
}
