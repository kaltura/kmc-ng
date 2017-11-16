import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';

export class NewEntryFlavourFile extends KalturaUploadFile {
  constructor(file: File) {
    super(file);
  }
}
