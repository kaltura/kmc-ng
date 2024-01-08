import { Component } from '@angular/core';
import { DocumentsStore } from './documents/documents-store/documents-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'kRooms',
    templateUrl: './content-documents.component.html',
    styleUrls: ['./content-documents.component.scss'],
    providers: [
        DocumentsStore,
        KalturaLogger,
        {
            provide: KalturaLoggerName, useValue: 'documents-store.service'
        }
    ]
})
export class ContentDocumentsComponent {}

