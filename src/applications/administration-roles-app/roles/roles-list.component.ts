import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { RolesService } from './roles.service';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kRolesList',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})

export class RolesListComponent implements OnInit, OnDestroy {
  @ViewChild('editPopup') public editPopup: PopupWidgetComponent;

  public _blockerMessage: AreaBlockerMessage = null;
  public _roles: KalturaUserRole[] = [];
  public _rolesTotalCount = 0;
  public _currentEditRole: KalturaUserRole = null;
  public _currentEditRoleIsDuplicated = false;
  public _filter = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(private _rolesService: RolesService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._rolesService.queryData$
      .cancelOnDestroy(this)
      .subscribe(
        query => {
          this._filter.pageSize = query.pageSize;
          this._filter.pageIndex = query.pageIndex;
        });

    this._rolesService.roles.data$
      .cancelOnDestroy(this)
      .subscribe(({ items, totalCount }) => {
          this._roles = items;
          this._rolesTotalCount = totalCount;
        }
      );

    if (this.editPopup) {
      this.editPopup.state$
        .cancelOnDestroy(this)
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Close) {
            this._currentEditRoleIsDuplicated = false;
          }
        });
    }
  }

  ngOnDestroy() {
  }

  private _editRole(role: KalturaUserRole): void {
    this._currentEditRole = role;
    this.editPopup.open();
  }

  private _deleteRole(role: KalturaUserRole): void {
    this._blockerMessage = null;
    this._rolesService.deleteRole(role)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => this._deleteRole(role)
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => this._blockerMessage = null
                }
              ]
            }
          );
        }
      );
  }


  private _duplicateRole(role: KalturaUserRole): void {
    this._blockerMessage = null;
    this._rolesService.duplicateRole(role)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        (duplicatedRole) => {
          this._rolesService.reload(true);
          this._currentEditRoleIsDuplicated = true;
          this._editRole(duplicatedRole);
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => this._duplicateRole(role)
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => this._blockerMessage = null
                }
              ]
            }
          );
        }
      );
  }

  public _reload() {
    this._rolesService.reload(true);
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {

      this._rolesService.reload({
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
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.administration.roles.confirmDeleteHeader'),
            message: this._appLocalization.get('applications.administration.roles.confirmDeleteBody', { 0: role.name }),
            accept: () => {
              this._deleteRole(role);
            }
          }
        );
        break;
      default:
        break;
    }
  }

  public _addRole(): void {
    this._currentEditRole = null;
    this.editPopup.open();
  }
}
