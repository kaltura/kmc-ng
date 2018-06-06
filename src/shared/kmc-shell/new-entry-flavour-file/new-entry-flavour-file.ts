import { KalturaUploadFile } from 'app-shared/kmc-shared/upload-management';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';

export class NewEntryFlavourFile extends KalturaUploadFile {
  constructor(file: File, public entryId?: string, public mediaType?: KalturaMediaType) {
    super(file);
  }
}
