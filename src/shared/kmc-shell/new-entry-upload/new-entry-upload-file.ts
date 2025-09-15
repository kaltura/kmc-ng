import { KalturaUploadFile } from 'app-shared/kmc-shared/upload-management/kaltura-upload-file';
import {KalturaDocumentType, KalturaMediaType} from 'kaltura-ngx-client';
import { ISubscription } from 'rxjs/Subscription';

export class NewEntryUploadFile extends KalturaUploadFile {
  public entryId: string;
  public createMediaEntrySubscription: ISubscription;
  constructor(file: File,
              public mediaType: KalturaMediaType | KalturaDocumentType,
              public transcodingProfileId: number,
              public entryName: string = file.name) {
    super(file);
  }
}
