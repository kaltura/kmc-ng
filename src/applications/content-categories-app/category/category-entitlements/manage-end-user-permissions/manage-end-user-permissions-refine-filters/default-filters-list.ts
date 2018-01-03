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
        value: KalturaCategoryUserPermissionLevel.contributor.toString(),
        label: 'Contributor'
      }, {
        value: KalturaCategoryUserPermissionLevel.moderator.toString(),
        label: 'Moderator'
      }, {
        value: KalturaCategoryUserPermissionLevel.member.toString(),
        label: 'Member'
      }, {
        value: KalturaCategoryUserPermissionLevel.manager.toString(),
        label: 'Manager'
      }
    ]
  },
  {
    name: 'status', label: 'Status',
    items: [
      {value: KalturaCategoryUserStatus.active.toString(), label: 'Active'},
      {value: KalturaCategoryUserStatus.notActive.toString(), label: 'Deactivated'}
    ]
  },
  {
    name: 'updateMethod', label: 'Update Method',
    items: [
      {
        value: KalturaUpdateMethodType.manual.toString(),
        label: 'Manual'
      },
      {
        value: KalturaUpdateMethodType.automatic.toString(),
        label: 'Automatic'
      }
    ]
  },
];
