import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BulkUploadAddAction } from '@kaltura-ng/kaltura-client/api/types/BulkUploadAddAction';
import { KalturaBulkUploadType } from '@kaltura-ng/kaltura-client/api/types/KalturaBulkUploadType';
import { KalturaBulkUploadCsvJobData } from '@kaltura-ng/kaltura-client/api/types/KalturaBulkUploadCsvJobData';
import { CategoryAddFromBulkUploadAction } from '@kaltura-ng/kaltura-client/api/types/CategoryAddFromBulkUploadAction';
import { KalturaBulkUploadCategoryData } from '@kaltura-ng/kaltura-client/api/types/KalturaBulkUploadCategoryData';
import { KalturaBulkUploadUserData } from '@kaltura-ng/kaltura-client/api/types/KalturaBulkUploadUserData';
import { KalturaBulkUploadCategoryUserData } from '@kaltura-ng/kaltura-client/api/types/KalturaBulkUploadCategoryUserData';
import { UserAddFromBulkUploadAction } from '@kaltura-ng/kaltura-client/api/types/UserAddFromBulkUploadAction';
import { CategoryUserAddFromBulkUploadAction } from '@kaltura-ng/kaltura-client/api/types/CategoryUserAddFromBulkUploadAction';
import { Observable } from 'rxjs/Observable';
import { KalturaBulkUpload } from '@kaltura-ng/kaltura-client/api/types/KalturaBulkUpload';

export enum BulkUploadTypes {
  entries,
  categories,
  endUsers,
  endUsersEntitlement
}

@Injectable()
export class BulkUploadService {
  constructor(private _kalturaServerClient: KalturaClient) {
  }

  private _getKalturaBulkUploadType(file: File): KalturaBulkUploadType {
    const extension = /(?:\.([^.]+))?$/.exec(file.name)[1];
    return 'csv' === extension ? KalturaBulkUploadType.csv : KalturaBulkUploadType.xml;
  }

  private _getKalturaActionByType(fileData: File, type: BulkUploadTypes): BulkUploadAddAction
    | CategoryAddFromBulkUploadAction
    | UserAddFromBulkUploadAction
    | CategoryUserAddFromBulkUploadAction {

    const bulkUploadData = new KalturaBulkUploadCsvJobData();
    bulkUploadData.fileName = fileData.name;

    switch (type) {
      case BulkUploadTypes.entries:
        return new BulkUploadAddAction({
          conversionProfileId: -1,
          csvFileData: fileData,
          bulkUploadType: this._getKalturaBulkUploadType(fileData)
        });
      case BulkUploadTypes.categories:
        return new CategoryAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadCategoryData: new KalturaBulkUploadCategoryData()
        });
      case BulkUploadTypes.endUsers:
        return new UserAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadUserData: new KalturaBulkUploadUserData()
        });
      case BulkUploadTypes.endUsersEntitlement:
        return new CategoryUserAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadCategoryUserData: new KalturaBulkUploadCategoryUserData()
        });
      default:
        return null;
    }
  }

  private _getAction(files: File[], type: BulkUploadTypes): (BulkUploadAddAction
    | CategoryAddFromBulkUploadAction
    | UserAddFromBulkUploadAction
    | CategoryUserAddFromBulkUploadAction)[] {
    return files
      .map(file => this._getKalturaActionByType(file, type))
      .filter(Boolean);
  }

  public upload(files: FileList, type: BulkUploadTypes): Observable<KalturaBulkUpload> {
    const actions = this._getAction(Array.from(files), type);

    return Observable.from(actions)
      .flatMap(action => this._kalturaServerClient.request(action));
  }
}
