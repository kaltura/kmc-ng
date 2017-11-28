import { KalturaUploadFile } from 'app-shared/kmc-shared';
import { KalturaMediaType } from '@kaltura-ng/kaltura-client/api/types/KalturaMediaType';
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
