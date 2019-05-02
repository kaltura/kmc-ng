import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AccountFilters, MultiAccountStoreService } from '../multi-account-store/multi-account-store.service';
import { KalturaUserRole } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import {AdminMultiAccountMainViewService, AdminRolesMainViewService} from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kAccountsList',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss'],
  providers: [KalturaLogger.createLogger('AccountsListComponent')]
})

export class AccountsListComponent implements OnInit, OnDestroy {
  @ViewChild('newAccountPopup') public newAccountPopup: PopupWidgetComponent;

  public _kmcPermissions = KMCPermissions;
  public _blockerMessage: AreaBlockerMessage = null;
  public _tableIsBusy = false;
  public _tableBlockerMessage: AreaBlockerMessage = null;
  public _query = {
    createdBefore: null,
    pageIndex: 0,
    pageSize: 25,
  };

  constructor(public _accountsStore: MultiAccountStoreService,
              private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _adminMultiAccountMainViewService: AdminMultiAccountMainViewService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
      if (this._adminMultiAccountMainViewService.viewEntered()) {
          this._prepare();
      }
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
      this._logger.info(`initiate accounts list view`);
      this._restoreFiltersState();
      this._registerToFilterStoreDataChanges();
      this._registerToDataChanges();
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._accountsStore.cloneFilters(
      [
        'pageSize',
        'pageIndex',
      ]
    ));
  }

  private _updateComponentState(updates: Partial<AccountFilters>): void {
    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._accountsStore.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._browserService.scrollToTop();
      });
  }

  private _registerToDataChanges(): void {
    this._accountsStore.accounts.state$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        result => {

          this._tableIsBusy = result.loading;

          if (result.errorMessage) {
            this._tableBlockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || this._appLocalization.get('applications.administration.roles.errors.loadError'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._tableBlockerMessage = null;
                  this._accountsStore.reload();
                }
              }]
            });
          } else {
            this._tableBlockerMessage = null;
          }
        });
  }

  private _deletAccount(partnerID: number): void {
    this._logger.info(`handle delete account request by user`);
    this._blockerMessage = null;
    this._accountsStore.deleteAccount(partnerID)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this._logger.info(`handle successful delete account request by user`);
          this._blockerMessage = null;
          this._accountsStore.reload();
        },
        error => {
          this._logger.warn(`handle failed delete account request by user, show confirmation`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user confirmed, retry action`);
                    this._deletAccount(partnerID);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._logger.info(`user didn't confirm, abort action, dismiss alert`);
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          );
        }
      );
  }

  public _reload() {
    this._accountsStore.reload();
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._accountsStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _onActionSelected({ action, pid }: { action: string, pid: number }): void {
    switch (action) {
      case 'edit':
        break;
      case 'delete':
        this._logger.info(`handle delete account action by user, show confirmation`, { id: pid });
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.administration.roles.confirmDeleteHeader'),
            message: this._appLocalization.get('applications.administration.roles.confirmDeleteBody', { 0: pid }),
            accept: () => {
              this._logger.info(`user confirmed, proceed action`);
              this._deletAccount(pid);
            },
            reject: () => {
              this._logger.info(`user didn't confirmed, abort action`);
            }
          }
        );
        break;
      default:
        break;
    }
  }

  public _addAccount(): void {
    this._logger.info(`handle create new account action by user`);
    this.newAccountPopup.open();
  }
}
