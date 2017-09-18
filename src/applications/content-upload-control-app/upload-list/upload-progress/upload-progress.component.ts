import { Component, Input } from '@angular/core';

@Component({
  selector: 'kUploadProgress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss'],
})
export class UploadProgressComponent {
  @Input() progress = 0;
  @Input() status: 'uploading' | 'uploaded' | 'uploadFailed' | 'pending';
}

