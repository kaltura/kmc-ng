import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { RequestFactory } from '@kaltura-ng/kaltura-common';
import { DropFolderFileListAction } from 'kaltura-ngx-client/api/types/DropFolderFileListAction';
import { KalturaDropFolderFileListResponse } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileListResponse';
import { KalturaDropFolderFileFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileFilter';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';

export class DropFoldersRequestFactory implements RequestFactory<DropFolderFileListAction, KalturaDropFolderFileListResponse> {
  public uploadedOn: Date;
  public dropFolderIdIn: string;

  constructor() {
  }

  create(): DropFolderFileListAction {
    if (this.uploadedOn === null || this.dropFolderIdIn === null) {
      return null;
    }

    return new DropFolderFileListAction({
      filter: new KalturaDropFolderFileFilter({
        createdAtGreaterThanOrEqual: this.uploadedOn,
        dropFolderIdIn: this.dropFolderIdIn
      }),
      pager: new KalturaFilterPager({pageSize: 1000})
    }).setRequestOptions({
        responseProfile: new KalturaDetachedResponseProfile({
          type: KalturaResponseProfileType.includeFields,
          fields: 'id,status,createdAt'
      })
    });
  }
}
