import { KalturaUploadFile } from 'app-shared/kmc-shared';

export class NewEntryCaptionFile extends KalturaUploadFile {
  public captionId?: string;
  constructor(file: File) {
    super(file);
  }
}
