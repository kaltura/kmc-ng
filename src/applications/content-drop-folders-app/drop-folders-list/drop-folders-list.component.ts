import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DropFoldersFilters, DropFoldersStoreService, SortDirection } from '../drop-folders-store/drop-folders-store.service';
import { Router } from '@angular/router';
import { subApplicationsConfig } from 'config/sub-applications';
import { KalturaDropFolderFile } from 'kaltura-ngx-client/api/types/KalturaDropFolderFile';
import { BrowserService } from 'app-shared/kmc-shell';
import { StickyComponent } from '@kaltura-ng/kaltura-ui/sticky/components/sticky.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { DropFoldersRefineFiltersService, RefineList } from '../drop-folders-store/drop-folders-refine-filters.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kDropFoldersList',
  templateUrl: './drop-folders-list.component.html',
  styleUrls: ['./drop-folders-list.component.scss'],
    providers: [
        DropFoldersRefineFiltersService,
        KalturaLogger.createLogger('DropFoldersListComponent')
    ]
})

export class DropFoldersListComponent implements OnInit, OnDestroy {
  @ViewChild('tags') private _tags: StickyComponent;

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;
    public _tableIsBusy = false;
    public _tableBlockerMessage: AreaBlockerMessage = null;
    public _refineFilters: RefineList[];
  public _selectedDropFolders: KalturaDropFolderFile[] = [];
  public _query = {
    freeText: '',
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading drop folders
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(public _dropFoldersStore: DropFoldersStoreService,
              private _refineFiltersService: DropFoldersRefineFiltersService,
              private _appLocalization: AppLocalization,
              private _router: Router,
              private _browserService: BrowserService,
              private _logger: KalturaLogger) {
  }

  ngOnInit() {
    this._prepare();
  }

  ngOnDestroy() {
  }

    private _prepare(): void {

        // NOTICE: do not execute here any logic that should run only once.
        // this function will re-run if preparation failed. execute your logic
        // only once the filters were fetched successfully.

        this._logger.info(`prepare component, load filters data`);

        this._isBusy = true;
        this._refineFiltersService.getFilters()
            .cancelOnDestroy(this)
            .first() // only handle it once, no need to handle changes over time
            .subscribe(
                lists => {
                    this._logger.info(`handle successful load filters data`);
                    this._isBusy = false;
                    this._refineFilters = lists;
                    this._restoreFiltersState();
                    this._registerToFilterStoreDataChanges();
                    this._registerToDataChanges();
                },
                error => {
                    this._logger.warn(`handle failed load filters data, show alert`, { errorMessage: error.message });
                    this._isBusy = false;
                    this._blockerMessage = new AreaBlockerMessage({
                        message: this._appLocalization.get('applications.content.filters.errorLoading'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => {
                                this._logger.info(`user selected retry, retry loading data`);
                                this._blockerMessage = null;
                                this._prepare();
                                this._dropFoldersStore.reload();
                            }
                        }
                        ]
                    });
                });
    }

    private _registerToDataChanges(): void {
        this._dropFoldersStore.dropFolders.state$
            .cancelOnDestroy(this)
            .subscribe(result => {
                    this._tableIsBusy = result.loading;

                    if (result.errorMessage) {
                        this._tableBlockerMessage = new AreaBlockerMessage({
                            message: result.errorMessage || 'Error loading drop folders',
                            buttons: [{
                                label: 'Retry',
                                action: () => {
                                    this._tableBlockerMessage = null;
                                    this._dropFoldersStore.reload();
                                }
                            }
                            ]
                        });
                    } else {
                        this._tableBlockerMessage = null;
                    }
                });
    }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._dropFoldersStore.cloneFilters(
      [
        'pageSize',
        'pageIndex',
        'freeText',
        'sortBy',
        'sortDirection'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<DropFoldersFilters>): void {
    if (typeof updates.freeText !== 'undefined') {
      this._query.freeText = updates.freeText || '';
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
  }

  private _registerToFilterStoreDataChanges(): void {
    this._dropFoldersStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._clearSelection();
        this._browserService.scrollToTop();
      });
  }

  private _deleteDropFiles(ids: number[]): void {
      this._logger.info(`handle delete files request`, { fileIds: ids });
    const execute = () => {
      this._dropFoldersStore.deleteDropFiles(ids)
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(
          () => {
              this._logger.info(`handle successful delete files request`);
            this._dropFoldersStore.reload();
            this._clearSelection();
          },
          error => {
              this._logger.info(`handle failed delete files request, show confirmation`);
            this._blockerMessage = new AreaBlockerMessage({
              message: this._appLocalization.get('applications.content.dropFolders.errors.errorDropFoldersFiles'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                      this._logger.info(`user confirmed, retry action`);
                    this._blockerMessage = null;
                    this._deleteDropFiles(ids);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                      this._logger.info(`user didn't confirm, abort action`);
                    this._blockerMessage = null;
                  }
                }
              ]
            });
          }
        );
    };

    if (ids.length > subApplicationsConfig.shared.bulkActionsLimit) {
        this._logger.info(`files count bigger than limit, show confirmation`, { filesCount: ids.length, limit: subApplicationsConfig.shared.bulkActionsLimit });
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.bulkActions.note'),
        message: this._appLocalization.get('applications.content.bulkActions.confirmDropFolders', { '0': ids.length }),
        accept: () => {
            this._logger.info(`user confirmed, proceed action`);
            execute();
        },
          reject: () => {
              this._logger.info(`user didn't confirm, abort action`);
          }
      });
    } else {
      execute();
    }
  }

  public _bulkDelete(_selectedDropFolders: KalturaDropFolderFile[]): void {
      this._logger.info(
          `handle bulk action by user, show confirmation dialog`,
          () => ({ dropFolders: _selectedDropFolders.map(file => ({ fileId: file.id, fileName: file.fileName })) })
      );
    const dropFolderFilesToDelete = _selectedDropFolders.map((file, index) => `${index + 1}: ${(file.fileName)}`);
    const dropFolderFiles = _selectedDropFolders.length <= 10 ? dropFolderFilesToDelete.join(',').replace(/,/gi, '\n') : '';
    this._browserService.confirm({
      header: this._appLocalization.get('applications.content.dropFolders.deleteFiles'),
      message: this._appLocalization.get('applications.content.dropFolders.confirmDelete', { 0: dropFolderFiles }),
      accept: () => {
          this._logger.info(`user confirmed, proceed action`);
        setTimeout(() => {
          this._deleteDropFiles(_selectedDropFolders.map(file => file.id));
        }, 0);
      },
        reject: () => {
            this._logger.info(`user didn't confirm, abort action`);
        }
    });
  }

  public _clearSelection(): void {
      this._logger.info(`handle clear selection action by user`);
    this._selectedDropFolders = [];
  }

  public _onFreetextChanged(): void {
    this._dropFoldersStore.filter({ freeText: this._query.freeText });
  }

  public _onSortChanged(event): void {
      if (event.field !== this._query.sortBy || event.order !== this._query.sortDirection) {
          this._dropFoldersStore.filter({
              sortBy: event.field,
              sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
          });
      }
  }

  public _reload(): void {
      this._logger.info(`handle reload list data action by user`);
    this._clearSelection();
    this._dropFoldersStore.reload();
  }

  public _navigateToEntry(entryId: string): void {
      this._logger.info(`handle navigate to entry action by user, check if entry exists`, { entryId });
    this._dropFoldersStore.isEntryExist(entryId)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        exists => {
          if (exists) {
              this._logger.info(`entry exists, proceed action`);
            this._router.navigate(['/content/entries/entry', entryId]);
          } else {
              this._logger.info(`entry does not exist, abort action`);
          }
        },
        ({ message }) => {
            this._logger.warn(`failed check if entry exists`, { errorMessage: message });
            this._browserService.alert({ message });
        }
      );
  }

  public _deleteDropFolderFiles(event): void {
      this._logger.info(`handle delete drop folder files action by user, show confirmation`);
    this._browserService.confirm({
      header: this._appLocalization.get('applications.content.dropFolders.deleteFiles'),
      message: this._appLocalization.get('applications.content.dropFolders.confirmDeleteSingle', {
        0: event.name ? event.name : event.fileName
      }),
      accept: () => {
          this._logger.info(`user confirmed, proceed action`);
          this._deleteDropFiles([event.id]);
      },
        reject: () => {
            this._logger.info(`user didn't confirm, abort action`);
        }
    });
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._dropFoldersStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _onTagsChange() {
    this._tags.updateLayout();
  }
}
