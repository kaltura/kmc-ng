import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../manage-end-user-permissions.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {MenuItem} from 'primeng/primeng';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-typescript-client/types/KalturaCategoryUserPermissionLevel';
import {KalturaUpdateMethodType} from "kaltura-typescript-client/types/KalturaUpdateMethodType";

@Component({
  selector: 'kManageEndUserPermissionsBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss']
})
export class ManageEndUserPermissionsBulkOperationsComponent implements OnInit {

  @Input() selectedItems: User[] = [];
  @Input() itemsTotalCount = 0;
  @Input() categoryInheritUserPermissions: boolean = false;

  @Output() addItem = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteItems = new EventEmitter<User[]>();
  @Output()
  onActionSelected = new EventEmitter<{action: 'activate' | 'deactivate' | 'setPermissionLevel'| 'updateMethod' | 'delete', users: User[], actionPayload?: any}>();

  public _freetextSearch: string = '';

  public _bulkActionsMenu: MenuItem[] = [];

  constructor(private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._bulkActionsMenu = this.getBulkActionItems();
  }


  onFreetextChanged(): void {
    // todo: [kmcng]
  }

  getBulkActionItems(): MenuItem[] {
    return [
      {
        label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.active'), items: [
        { label: this._appLocalization.get('app.common.yes'), command: (event) => {
          this.onActionSelected.emit({action: 'activate', users: this.selectedItems});
        } },
        { label: this._appLocalization.get('app.common.no'), command: (event) => {
          this.onActionSelected.emit({action: 'deactivate', users: this.selectedItems});
        } }]
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevel'), items: [
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.member'), command: (event) => {
          this.onActionSelected.emit({action: 'setPermissionLevel', users: this.selectedItems, actionPayload: KalturaCategoryUserPermissionLevel.member});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.contributor'), command: (event) => {
          this.onActionSelected.emit({action: 'setPermissionLevel', users: this.selectedItems, actionPayload: KalturaCategoryUserPermissionLevel.contributor});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.moderator'), command: (event) => {
          this.onActionSelected.emit({action: 'setPermissionLevel', users: this.selectedItems, actionPayload: KalturaCategoryUserPermissionLevel.moderator});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.manager'), command: (event) => {
          this.onActionSelected.emit({action: 'setPermissionLevel', users: this.selectedItems, actionPayload: KalturaCategoryUserPermissionLevel.manager});
        } }]
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.updateMethod'), items: [
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.updateMethodOptions.automatic'), command: (event) => {
          alert('automatic');
          this.onActionSelected.emit({action: 'updateMethod', users: this.selectedItems, actionPayload: KalturaUpdateMethodType.automatic});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.updateMethodOptions.manual'), command: (event) => {
          this.onActionSelected.emit({action: 'updateMethod', users: this.selectedItems, actionPayload: KalturaUpdateMethodType.manual});
        } }]
      },
      { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.removeUsers'), command: (event) => {
          this._deleteItems();
      } }
    ];
  }

  public _deleteItems(): void {
    this.clearSelection.emit();
    this.onActionSelected.emit({action: 'delete', users: this.selectedItems});
  }
}
