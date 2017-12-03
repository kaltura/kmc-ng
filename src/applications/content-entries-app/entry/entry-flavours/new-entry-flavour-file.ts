import { KalturaUploadFile } from 'app-shared/kmc-shared';

export class NewEntryFlavourFile extends KalturaUploadFile {
  constructor(file: File) {
    super(file);
  }
}
