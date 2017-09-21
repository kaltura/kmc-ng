import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppLocalization, TrackedFileStatuses } from '@kaltura-ng/kaltura-common';
import { UploadFileData } from './upload-list.component';


@Component({
  selector: 'kUploadListTable',
  templateUrl: './upload-list-table.component.html',
  styleUrls: ['./upload-list-table.component.scss']
})
export class UploadListTableComponent {
  @Input() uploads: UploadFileData[];
  @Input() selectedUploads: UploadFileData[] = [];

  @Output() onSelectedEntriesChange = new EventEmitter<any>();
  @Output() onCancelUpload = new EventEmitter<UploadFileData>();

  public _emptyMessage = this._appTranslation.get('applications.content.table.noResults');

  constructor(private _appTranslation: AppLocalization) {
  }

  public _relatedTableRowStyle(rowData: UploadFileData): string {
    return rowData.status === TrackedFileStatuses.uploadFailed ? 'has-error' : '';
  }
}

