import {KalturaCategoryUserPermissionLevel} from "kaltura-ngx-client/api/types/KalturaCategoryUserPermissionLevel";
import {KalturaUpdateMethodType} from "kaltura-ngx-client/api/types/KalturaUpdateMethodType";
import {KalturaCategoryUserStatus} from "kaltura-ngx-client/api/types/KalturaCategoryUserStatus";

export interface DefaultFilterList {
  label: string;
  name: string;
  items: { value: string, label: string }[]
}

// TODO [kmcng] - add translations to labels
export const DefaultFiltersList: DefaultFilterList[] = [
  {
    name: 'permissionLevels', label: 'Permission Levels',
    items: [
      {
        value: KalturaCategoryUserPermissionLevel.contributor,
        label: 'Contributor'
      }, {
        value: KalturaCategoryUserPermissionLevel.moderator,
        label: 'Moderator'
      }, {
        value: KalturaCategoryUserPermissionLevel.member,
        label: 'Member'
      }, {
        value: KalturaCategoryUserPermissionLevel.manager,
        label: 'Manager'
      }
    ]
  },
  {
    name: 'status', label: 'Status',
    items: [
      {value: KalturaCategoryUserStatus.active, label: 'Active'},
      {value: KalturaCategoryUserStatus.notActive, label: 'Deactivated'}
    ]
  },
  {
    name: 'updateMethod', label: 'Update Method',
    items: [
      {
        value: KalturaUpdateMethodType.manual,
        label: 'Manual'
      },
      {
        value: KalturaUpdateMethodType.automatic,
        label: 'Automatic'
      }
    ]
  },
];
