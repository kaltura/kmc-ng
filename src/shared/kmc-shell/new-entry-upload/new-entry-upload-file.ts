import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { ISubscription } from 'rxjs/Subscription';

export class NewEntryUploadFile extends KalturaUploadFile {
  public entryId: string;
  public createMediaEntrySubscription: ISubscription;
  constructor(file: File,
              public mediaType: KalturaMediaType,
              public transcodingProfileId: number,
              public entryName: string = file.name) {
    super(file);
  }
}
