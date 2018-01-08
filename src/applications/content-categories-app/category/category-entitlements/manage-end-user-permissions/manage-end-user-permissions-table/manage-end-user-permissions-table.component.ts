import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import { EndUserPermissionsUser, ManageEndUserPermissionsService } from '../manage-end-user-permissions.service';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-ngx-client/api/types/KalturaCategoryUserPermissionLevel';
import {KalturaUpdateMethodType} from 'kaltura-ngx-client/api/types/KalturaUpdateMethodType';
import {KalturaCategoryUserStatus} from 'kaltura-ngx-client/api/types/KalturaCategoryUserStatus';
import {UserActionData} from '../manage-end-user-permissions.component';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kManageEndUserPermissionsTable',
  templateUrl: './manage-end-user-permissions-table.component.html',
  styleUrls: ['./manage-end-user-permissions-table.component.scss']
})
export class ManageEndUserPermissionsTableComponent implements OnInit, AfterViewInit, OnDestroy {
  public _users: EndUserPermissionsUser[] = [];
  public _blockerMessage: AreaBlockerMessage = null;
  private _deferredUsers: any[];
  public _deferredLoading = true;

  @Input()
  set users(data: EndUserPermissionsUser[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of Users
      // (ie when returning from UserPermission page) - we should force detect changes on an empty list
      this._users = [];
      this.cdRef.detectChanges();
      this._users = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredUsers = data
    }
  }

  @Input() filter: any = {};
  @Input() selectedUsers: EndUserPermissionsUser[] = [];
  @Input() categoryInheritUserPermissions = false;

  @Output()
  sortChanged = new EventEmitter<any>();
  @Output()
  onActionSelected = new EventEmitter<UserActionData>();
  @Output()
  selectedUsersChange = new EventEmitter<any>();
  @Output()
  closeParentPopup = new EventEmitter<void>();

  private _usersServiceStatusSubscription: ISubscription;
  public _permissionLevelOptions: { value: number, label: string }[] = [];
  public _updateMethodOptions: { value: number, label: string }[] = [];
  public _kalturaCategoryUserStatus = KalturaCategoryUserStatus;
  public _emptyMessage = '';

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private _appLocalization: AppLocalization,
              public manageEndUserPermissionsService: ManageEndUserPermissionsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to "no results" only after search
    this._fillPermissionLevelOptions();
    this._fillUpdateMethodOptions();
    
    this._usersServiceStatusSubscription = this.manageEndUserPermissionsService.users.state$.subscribe(
      result => {
        if (result.errorMessage) {
          this._blockerMessage = new AreaBlockerMessage({
            message: result.errorMessage ||
            this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.loadEndUserPermissions'),
            buttons: [{
              label: this._appLocalization
                .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.backToEntitlements'),
              action: () => {
                this._blockerMessage = null;
                this.closeParentPopup.emit();
              }
            }
            ]
          });
        } else {
          this._blockerMessage = null;
          if (result.loading) {
            this._emptyMessage = '';
            loadedOnce = true;
          } else {
            if (loadedOnce) {
              this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
            }
          }
        }
      },
      error => {
        console.warn('[kmcng] -> could not load end users permissions'); // navigate to error page
        throw error;
      });
  }

  private _fillPermissionLevelOptions() {
    this._permissionLevelOptions = [{
      value: KalturaCategoryUserPermissionLevel.member,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.member')
    }, {
      value: KalturaCategoryUserPermissionLevel.contributor,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.contributor')
    }, {
      value: KalturaCategoryUserPermissionLevel.moderator,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.moderator')
    }, {
      value: KalturaCategoryUserPermissionLevel.manager,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.manager')
    }];
  }

  private _fillUpdateMethodOptions() {
    this._updateMethodOptions = [{
      value: KalturaUpdateMethodType.automatic,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.table.updateMethodOptions.automatic')
    }, {
      value: KalturaUpdateMethodType.manual,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.table.updateMethodOptions.manual')
    }];
  }

  ngOnDestroy() {
    this._usersServiceStatusSubscription.unsubscribe();
    this._usersServiceStatusSubscription = null;
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._users = this._deferredUsers;
        this._deferredUsers = null;
      }, 0);
    }
  }

  _onActionSelected(userActionData: UserActionData) {
    this.onActionSelected.emit(userActionData);

  }


  _onSelectionChange(event) {
    this.selectedUsersChange.emit(event);
  }

  _onSortChanged(event) {
    this.sortChanged.emit(event);
  }
}
