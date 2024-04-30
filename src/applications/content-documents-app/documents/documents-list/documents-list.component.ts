import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DocumentsFilters, DocumentsStore, SortDirection} from '../documents-store/documents-store.service';
import {KalturaDocumentEntry} from 'kaltura-ngx-client';
import {AreaBlockerMessage, StickyComponent} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAnalytics, BrowserService} from 'app-shared/kmc-shell/providers';
import {AppEventsService} from 'app-shared/kmc-shared';
import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {ContentDocumentViewService, ContentDocumentViewSections} from 'app-shared/kmc-shared/kmc-views/details-views';
import {ContentDocumentsMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import { asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import {
    CategoriesStatus,
    CategoriesStatusMonitorService
} from "app-shared/content-shared/categories-status/categories-status-monitor.service";
import {CategoriesModes} from "app-shared/content-shared/categories/categories-mode-type";
import {AppAuthentication} from 'app-shared/kmc-shell';

@Component({
  selector: 'kDocumentsList',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss']
})
export class DocumentsListComponent implements OnInit, OnDestroy {

  public _kmcPermissions = KMCPermissions;

  @ViewChild('tags', { static: true }) private tags: StickyComponent;

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;
    public _tableIsBusy = false;
    public _tableBlockerMessage: AreaBlockerMessage = null;
    public _categoriesUpdating = false;
    public _categoriesLocked = false;

  public _query = {
    freetext: '',
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    categories: [],
    categoriesMode: null,
    sortDirection: SortDirection.Desc
  };

  constructor(public _documentsStore: DocumentsStore,
              private _appLocalization: AppLocalization,
              private _appAuthentication: AppAuthentication,
              private _router: Router,
              private _appEvents: AppEventsService,
              private _browserService: BrowserService,
              private _analytics: AppAnalytics,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService,
              private _contentDocumentsMainViewService: ContentDocumentsMainViewService,
              private _contentDocumentViewService: ContentDocumentViewService) {
  }

  ngOnInit() {
    if (this._contentDocumentsMainViewService.viewEntered()) {
        this._categoriesStatusMonitorService.status$
            .pipe(cancelOnDestroy(this))
            .subscribe((status: CategoriesStatus) => {
                if (this._categoriesLocked && status.lock === false){
                    // categories were locked and now open - reload categories to reflect changes
                    this._reload();
                }
                this._categoriesLocked = status.lock;
                this._categoriesUpdating = status.update;
            });

        this._prepare();
    }
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
      this._restoreFiltersState();
      this._registerToFilterStoreDataChanges();
      this._registerToDataChanges();
  }

  private _deleteDocument(documentId: string): void {
    this._documentsStore.deleteDocument(documentId)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
            this._isBusy = true;
            setTimeout(() => {
                this._documentsStore.reload();
                this._isBusy = false;
            }, 1000);

        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this._documentsStore.deleteDocument(documentId);
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          });
        }
      );
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._documentsStore.cloneFilters(
      [
        'freeText',
        'pageSize',
        'pageIndex',
        'sortBy',
        'sortDirection',
        'categories',
        'categoriesMode'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<DocumentsFilters>): void {
    if (typeof updates.freeText !== 'undefined') {
      this._query.freetext = updates.freeText || '';
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

    if (typeof updates.categoriesMode !== 'undefined') {
      this._query.categoriesMode = updates.categoriesMode === CategoriesModes.Self ? CategoriesModes.Self : CategoriesModes.SelfAndChildren;
    }

    if (typeof updates.categories !== 'undefined') {
      this._query.categories = [...updates.categories];
    }
  }

    onCategoriesModeChanged(categoriesMode)
    {
        this._documentsStore.filter({
            categoriesMode
        })
    }

    onCategoriesUnselected(categoriesToRemove: number[]) {
        const categories = this._documentsStore.cloneFilter('categories', []);

        categoriesToRemove.forEach(categoryToRemove => {
            const categoryIndex = categories.findIndex(item => item === categoryToRemove);
            if (categoryIndex !== -1) {
                categories.splice(
                    categoryIndex,
                    1
                );
            }
        });
        this._documentsStore.filter({categories});
    }

    onCategorySelected(category: number){
        const categories = this._documentsStore.cloneFilter('categories', []);
        if (!categories.find(item => item === category)) {
            categories.push(category);
            this._documentsStore.filter({'categories': categories});
        }
    }

  private _registerToFilterStoreDataChanges(): void {
    this._documentsStore.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._browserService.scrollToTop();
      });
  }

    private _registerToDataChanges(): void {
        this._documentsStore.documents.state$
            .pipe(observeOn(asyncScheduler))
            .pipe(cancelOnDestroy(this))
            .subscribe(
                result => {

                    this._tableIsBusy = result.loading;

                    if (result.errorMessage) {
                        this._tableBlockerMessage = new AreaBlockerMessage({
                            message: result.errorMessage || 'Error loading documents',
                            buttons: [{
                                label: 'Retry',
                                action: () => {
                                    this._tableBlockerMessage = null;
                                    this._documentsStore.reload();
                                }
                                },
                                {
                                    label: this._appLocalization.get('app.common.cancel'),
                                    action: () => {
                                        this._tableBlockerMessage = null;
                                    }
                                }
                            ]
                        })
                    } else {
                        this._tableBlockerMessage = null;
                    }
                },
                error => {
                    console.warn('[kmcng] -> could not load documents'); // navigate to error page
                    throw error;
                });
    }

  public _onTagsChange(): void {
    this.tags.updateLayout();
  }

  public _onActionSelected(event: { action: string, document: KalturaDocumentEntry }): void {
      switch (event.action) {
          case 'view':
              this._contentDocumentViewService.open({ document: event.document, section: ContentDocumentViewSections.Metadata });
              break;
          case 'download':
              this._browserService.openLink(event.document.downloadUrl + '/ks/' + this._appAuthentication.appUser.ks);
              break;
          case 'delete':
              this._browserService.confirm(
                  {
                      header: this._appLocalization.get('applications.content.documents.deleteDocument'),
                      message: this._appLocalization.get('applications.content.documents.confirmDeleteSingle', {0: event.document.name}),
                      accept: () => {
                          this._deleteDocument(event.document.id);
                      }
                  }
              );
              break;
          default:
              break;
      }
  }

  public _onFreetextChanged(): void {
      // prevent searching for empty strings
      if (this._query.freetext.length > 0 && this._query.freetext.trim().length === 0){
          this._query.freetext = '';
      }else {
          this._documentsStore.filter({freeText: this._query.freetext});
      }
  }

  public _onSortChanged(event): void {
      if (event.field !== this._query.sortBy || event.order !== this._query.sortDirection) {
          this._documentsStore.filter({
              sortBy: event.field,
              sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
          });
      }
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._documentsStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _reload(): void {
    this._documentsStore.reload();
  }

}
