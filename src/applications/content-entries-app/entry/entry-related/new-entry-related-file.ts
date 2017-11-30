import { KalturaUploadFile } from 'app-shared/kmc-shared';

export class NewEntryRelatedFile extends KalturaUploadFile {
  public assetId?: string;
  constructor(file: File) {
    super(file);
  }
}
