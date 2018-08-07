import { UploadFileData } from '@kaltura-ng/kaltura-common';
import 'rxjs/add/observable/throw';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

export class KalturaUploadFile implements UploadFileData {
  serverUploadToken: string;


  constructor(public file: File) {
  }

  getFileName(): string {
    return (this.file.name || '').trim();
  }

  getFileSize(): number {
    return this.file.size;
  }
}


