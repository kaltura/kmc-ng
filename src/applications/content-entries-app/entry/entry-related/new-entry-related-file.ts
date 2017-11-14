import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';

export class NewEntryRelatedFile extends KalturaUploadFile {
  public assetId?: string;
  constructor(file: File) {
    super(file);
  }
}
