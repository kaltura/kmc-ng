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
        value: String(KalturaCategoryUserPermissionLevel.contributor),
        label: 'Contributor'
      }, {
        value: String(KalturaCategoryUserPermissionLevel.moderator),
        label: 'Moderator'
      }, {
        value: String(KalturaCategoryUserPermissionLevel.member),
        label: 'Member'
      }, {
        value: String(KalturaCategoryUserPermissionLevel.manager),
        label: 'Manager'
      }
    ]
  },
  {
    name: 'status', label: 'Status',
    items: [
      {value: String(KalturaCategoryUserStatus.active), label: 'Active'},
      {value: String(KalturaCategoryUserStatus.notActive), label: 'Deactivated'}
    ]
  },
  {
    name: 'updateMethod', label: 'Update Method',
    items: [
      {
        value: String(KalturaUpdateMethodType.manual),
        label: 'Manual'
      },
      {
        value: String(KalturaUpdateMethodType.automatic),
        label: 'Automatic'
      }
    ]
  },
];
