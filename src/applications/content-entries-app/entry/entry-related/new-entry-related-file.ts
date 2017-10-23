import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';

export class NewEntryRelatedFile extends KalturaUploadFile {
  constructor(file: File) {
    super(file);
  }
}
