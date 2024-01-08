import { Injectable } from '@angular/core';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import { KalturaDocumentEntry, KalturaMultiRequest } from 'kaltura-ngx-client';
import { DocumentStore } from './document-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Injectable()
export class DocumentWidgetsManager extends WidgetsManagerBase<KalturaDocumentEntry, KalturaMultiRequest> {
  private _documentStore: DocumentStore;

  constructor(logger: KalturaLogger) {
    super(logger.subLogger('DocumentWidgetsManager'));
  }

  set documentStore(value: DocumentStore) {
    this._documentStore = value;
  }

  public returnToRooms(): void {
    if (this._documentStore) {
      this._documentStore.returnToDocuments();
    }
  }
}
