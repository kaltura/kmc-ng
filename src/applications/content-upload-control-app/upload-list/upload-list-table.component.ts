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

  ngOnChanges() {
    console.warn(this.uploads);
  }

  private _reorderFiles(): void {
    // TODO [kmcng]
    // this._updateFiles(R.sortBy(R.prop('statusWeight'))(this._getFiles()));
  }

  private _getStatusWeight(status: string): number {
    // TODO [kmcng]
    throw new Error('not implemented');
    // switch (status) {
    //     case 'uploadFailed':
    //     case 'uploadCompleted':
    //         return 0;
    //     case 'uploading':
    //         return 1;
    //     case 'pending':
    //         return 2;
    //     default:
    //         return 3;
    // }
  }


  public _relatedTableRowStyle(rowData: UploadFileData): string {
    return rowData.status === TrackedFileStatuses.uploadFailed ? 'has-error' : '';
  }
}

