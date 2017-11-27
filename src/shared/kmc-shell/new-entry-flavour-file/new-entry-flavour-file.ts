import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';

export class NewEntryFlavourFile extends KalturaUploadFile {
  constructor(file: File, public entryId?: string, public mediaType?: KalturaMediaType) {
    super(file);
  }
}
