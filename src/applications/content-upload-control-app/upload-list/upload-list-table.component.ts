import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TrackedFileStatuses } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { UploadFileData } from './upload-list.component';
import { ColumnsResizeManagerService, ResizableColumns, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';


@Component({
  selector: 'kUploadListTable',
  templateUrl: './upload-list-table.component.html',
  styleUrls: ['./upload-list-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'uploads-table' }
    ]
})
export class UploadListTableComponent {
  @Input() uploads: UploadFileData[];
  @Input() selectedUploads: UploadFileData[] = [];

  @Output() onSelectedEntriesChange = new EventEmitter<any>();
  @Output() onCancelUpload = new EventEmitter<UploadFileData>();
  @Output() onRetryUpload = new EventEmitter<UploadFileData>();

  public _emptyMessage = this._appTranslation.get('applications.content.table.noResults');
    public _columnsConfig: ResizableColumns;
    public _defaultColumnsConfig: ResizableColumns = {
        'name': 'auto',
        'entryId': '100px',
        'size': '100px',
        'uploadedOn': '120px',
        'status': '100px',
    };

    @HostListener('window:resize') _windowResize(): void {
        if (this._columnsResizeManager.onWindowResize()) {
            this._columnsConfig = this._defaultColumnsConfig;
        }
    }

  constructor(public _columnsResizeManager: ColumnsResizeManagerService,
              private _appTranslation: AppLocalization) {
      this._columnsConfig = Object.assign(
          {},
          this._defaultColumnsConfig,
          this._columnsResizeManager.getConfig()
      );
      this._windowResize();
  }

  public _hasError(status: TrackedFileStatuses): boolean {
    return status === TrackedFileStatuses.failure;
  }

  public _relatedTableRowStyle(rowData: UploadFileData): string {
    return rowData.status === TrackedFileStatuses.failure ? 'has-error' : '';
  }

  public _canRemoveFile(file: UploadFileData): boolean {
    return file.status !== TrackedFileStatuses.uploadCompleted;
  }
}

