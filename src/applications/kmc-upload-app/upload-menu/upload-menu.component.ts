import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onFileSelected = new EventEmitter<FileList>();
}
