import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BulkUploadAddAction } from 'kaltura-typescript-client/types/BulkUploadAddAction';
import { KalturaBulkUploadType } from 'kaltura-typescript-client/types/KalturaBulkUploadType';
import { KalturaBulkUploadCsvJobData } from 'kaltura-typescript-client/types/KalturaBulkUploadCsvJobData';
import { CategoryAddFromBulkUploadAction } from 'kaltura-typescript-client/types/CategoryAddFromBulkUploadAction';
import { KalturaBulkUploadCategoryData } from 'kaltura-typescript-client/types/KalturaBulkUploadCategoryData';
import { KalturaBulkUploadUserData } from 'kaltura-typescript-client/types/KalturaBulkUploadUserData';
import { KalturaBulkUploadCategoryUserData } from 'kaltura-typescript-client/types/KalturaBulkUploadCategoryUserData';
import { UserAddFromBulkUploadAction } from 'kaltura-typescript-client/types/UserAddFromBulkUploadAction';
import { CategoryUserAddFromBulkUploadAction } from 'kaltura-typescript-client/types/CategoryUserAddFromBulkUploadAction';
import { Observable } from 'rxjs/Observable';

export enum BulkUploadTypes {
  entries,
  categories,
  endUsers,
  endUsersEntitlement
}

@Injectable()
export class BulkUploadMenuService {
  private _extensions = {
    [BulkUploadTypes.entries]: '.xml,.csv',
    [BulkUploadTypes.categories]: '.csv',
    [BulkUploadTypes.endUsers]: '.csv',
    [BulkUploadTypes.endUsersEntitlement]: '.csv'
  };

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

  private _getAction(files: Array<File>, type: BulkUploadTypes): Array<BulkUploadAddAction
    | CategoryAddFromBulkUploadAction
    | UserAddFromBulkUploadAction
    | CategoryUserAddFromBulkUploadAction> {
    return files
      .map(file => this._getKalturaActionByType(file, type))
      .filter(Boolean);
  }

  private _handleUploadSuccess(res: any): void {
    if (res.error) {
      return this._handleUploadError(res.error);
    }
  }

  private _handleUploadError(error: any): void {
    console.log(error);
  }

  public getAllowedExtension(type: BulkUploadTypes): string {
    if (type in this._extensions) {
      return this._extensions[type];
    }

    throw Error('Bulk upload type is not supported');
  }

  public upload(files: FileList, type: BulkUploadTypes): void {
    const actions = this._getAction(Array.from(files), type);

    Observable.from(actions)
      .concatMap(action => this._kalturaServerClient.request(action))
      .subscribe(
        (res) => this._handleUploadSuccess(res),
        error => this._handleUploadError(error)
      );
  }
}
