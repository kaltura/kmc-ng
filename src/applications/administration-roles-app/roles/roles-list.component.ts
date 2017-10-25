import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {RolesService} from './roles.service';
import {KalturaUserRole} from 'kaltura-typescript-client/types/KalturaUserRole';
import {BrowserService} from 'app-shared/kmc-shell';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kRolesList',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})

export class RolesListComponent implements OnInit, OnDestroy {

  @ViewChild('editPopup') public editPopup: PopupWidgetComponent;

  public _isBusy = false
  public _blockerMessage: AreaBlockerMessage = null;
  public _roles: KalturaUserRole[] = [];
  public _rolesTotalCount = '';
  public _currentEditRole: any = null;
  public _currentEditRoleIsDuplicated = false;

  public _filter = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(private _rolesService: RolesService,
              private _browserService: BrowserService,
              private appLocalization: AppLocalization) {
  }

  ngOnInit() {

    this._rolesService.queryData$
      .cancelOnDestroy(this)
      .subscribe(
        query => {
          this._filter.pageSize = query.pageSize;
          this._filter.pageIndex = query.pageIndex;
          this._browserService.scrollToTop();
        });

    this._rolesService.roles$
      .cancelOnDestroy(this)
      .subscribe(
        (data) => {
          this._roles = data.items;
          if (data.totalCount > 0) {
            this._rolesTotalCount =  this.appLocalization.get('applications.administration.roles.rolesNum', {0: data.totalCount});
          } else {
            this._rolesTotalCount = '';
          }
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

  public _reload() {
    this._rolesService.reload(true);
  }

  _onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {

      this._rolesService.reload({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  _onActionSelected(event: { action: string, role: KalturaUserRole }) {
    const action = event.action;
    const role = event.role;
    switch (action) {
      case 'edit':
        this.editRole(role);
        break;
      case 'duplicate':
        this.duplicateRole(role);
        break;
      case 'delete':
        this._browserService.confirm(
          {
            header: this.appLocalization.get('applications.administration.roles.confirmDeleteHeader'),
            message: this.appLocalization.get('applications.administration.roles.confirmDeleteBody', {0: role.name}),
            accept: () => {
              this.deleteRole(role);
            }
          }
        );
        break;
      default:
        break;
    }
  }

  public addRole(): void {
    this._currentEditRole = null;
    this.editPopup.open();
  }

  public editRole(role: KalturaUserRole): void {
    this._currentEditRole = role;
    this.editPopup.open();
  }

  private deleteRole(role: KalturaUserRole): void {
    this._isBusy = true;
    this._blockerMessage = null;
    this._browserService.scrollToTop();
    this._rolesService.deleteRole(role)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._isBusy = false;
          this._browserService.showGrowlMessage({
            severity: 'success',
            detail: this.appLocalization.get('applications.administration.roles.deleted')
          });
        },
        error => {
          this._isBusy = false;

          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this.appLocalization.get('app.common.retry'),
                  action: () => {
                    this.deleteRole(role);
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
          );
        }
      );
  }


  private duplicateRole(role: KalturaUserRole): void {
    this._isBusy = true;
    this._blockerMessage = null;
    this._rolesService.duplicateRole(role)
      .cancelOnDestroy(this)
      .subscribe(
        (duplicatedRole) => {
          this._isBusy = false;
          this._rolesService.reload(true);
          this._currentEditRoleIsDuplicated = true;
          this.editRole(duplicatedRole);
        },
        error => {
          this._isBusy = false;

          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this.appLocalization.get('app.common.retry'),
                  action: () => {
                    this.duplicateRole(role);
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
          );
        }
      );
  }
}
