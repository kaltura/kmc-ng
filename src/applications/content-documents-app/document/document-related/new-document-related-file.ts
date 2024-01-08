import { KalturaUploadFile } from 'app-shared/kmc-shared';

export class NewDocumentRelatedFile extends KalturaUploadFile {
  public assetId?: string;
  constructor(file: File) {
    super(file);
  }
}
