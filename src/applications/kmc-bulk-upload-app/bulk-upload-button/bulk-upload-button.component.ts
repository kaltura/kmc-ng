import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'kKMCBulkUploadButton',
    templateUrl: './bulk-upload-button.component.html',
    styleUrls: ['./bulk-upload-button.component.scss']
})
export class BulkUploadButtonComponent {
  @Output() onOpen = new EventEmitter<void>();
}
