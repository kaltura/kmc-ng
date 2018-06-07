import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RolesFilters, RolesStoreService } from '../roles-store/roles-store.service';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { AdminRolesMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kRolesList',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
  providers: [KalturaLogger.createLogger('RolesListComponent')]
})

export class RolesListComponent implements OnInit, OnDestroy {
  @ViewChild('editPopup') public editPopup: PopupWidgetComponent;

  public _kmcPermissions = KMCPermissions;
  public _blockerMessage: AreaBlockerMessage = null;
  public _tableIsBusy = false;
  public _tableBlockerMessage: AreaBlockerMessage = null;
  public _currentEditRole: KalturaUserRole = null;
  public _query = {
    createdBefore: null,
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(public _rolesStore: RolesStoreService,
              private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _adminRolesMainViewService: AdminRolesMainViewService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
      if (this._adminRolesMainViewService.viewEntered()) {
          this._prepare();
      }
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
      this._logger.info(`initiate roles list view`);
      this._restoreFiltersState();
      this._registerToFilterStoreDataChanges();
      this._registerToDataChanges();
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._rolesStore.cloneFilters(
      [
        'pageSize',
        'pageIndex',
      ]
    ));
  }

  private _updateComponentState(updates: Partial<RolesFilters>): void {
    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._rolesStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._browserService.scrollToTop();
      });
  }

  private _registerToDataChanges(): void {
    this._rolesStore.roles.state$
      .cancelOnDestroy(this)
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
                  this._rolesStore.reload();
                }
              }]
            });
          } else {
            this._tableBlockerMessage = null;
          }
        });
  }

  private _editRole(role: KalturaUserRole): void {
    this._logger.info(`handle edit role action by user`, { id: role.id, name: role.name });
    this._currentEditRole = role;
    this.editPopup.open();
  }

  private _deleteRole(role: KalturaUserRole): void {
    this._logger.info(`handle delete role request by user`);
    this._blockerMessage = null;
    this._rolesStore.deleteRole(role)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._logger.info(`handle successful delete role request by user`);
          this._blockerMessage = null;
          this._rolesStore.reload();
        },
        error => {
          this._logger.warn(`handle failed delete role request by user, show confirmation`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user confirmed, retry action`);
                    this._deleteRole(role);
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

  private _duplicateRole(role: KalturaUserRole): void {
    this._logger.info(`handle duplicate role request by user`, { id: role.id, name: role.name });
    this._blockerMessage = null;
    this._rolesStore.duplicateRole(role)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        (duplicatedRole) => {
          this._logger.info(`handle successful duplicate role request by user`);
          this._rolesStore.reload();
          this._blockerMessage = null;
          this._editRole(duplicatedRole);
        },
        error => {
          this._logger.warn(`handle failed duplicate role request by user, show confirmation`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user confirmed, retry action`);
                    this._duplicateRole(role);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._logger.info(`user didn't confirm, abort action, retry action`);
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
    this._rolesStore.reload();
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._rolesStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _onActionSelected({ action, role }: { action: string, role: KalturaUserRole }): void {
    switch (action) {
      case 'edit':
        this._editRole(role);
        break;
      case 'duplicate':
        this._duplicateRole(role);
        break;
      case 'delete':
        this._logger.info(`handle delete role action by user, show confirmation`, { id: role.id, name: role.name });
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.administration.roles.confirmDeleteHeader'),
            message: this._appLocalization.get('applications.administration.roles.confirmDeleteBody', { 0: role.name }),
            accept: () => {
              this._logger.info(`user confirmed, proceed action`);
              this._deleteRole(role);
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

  public _addRole(): void {
    this._logger.info(`handle add role action by user`);
    this._currentEditRole = null;
    this.editPopup.open();
  }
}
