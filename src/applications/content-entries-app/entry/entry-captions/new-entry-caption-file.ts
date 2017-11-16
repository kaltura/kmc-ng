import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';

export class NewEntryCaptionFile extends KalturaUploadFile {
  public captionId?: string;
  constructor(file: File) {
    super(file);
  }
}
