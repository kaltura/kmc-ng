import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { TrackedFileStatuses } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { UploadFileData } from './upload-list.component';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';


@Component({
  selector: 'kUploadListTable',
  templateUrl: './upload-list-table.component.html',
  styleUrls: ['./upload-list-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'uploads-table' }
    ]
})
export class UploadListTableComponent implements AfterViewInit {
  @Input() uploads: UploadFileData[];
  @Input() selectedUploads: UploadFileData[] = [];

  @Output() onSelectedEntriesChange = new EventEmitter<any>();
  @Output() onCancelUpload = new EventEmitter<UploadFileData>();
  @Output() onRetryUpload = new EventEmitter<UploadFileData>();

  public _emptyMessage = this._appTranslation.get('applications.content.table.noResults');

  constructor(public _columnsResizeManager: ColumnsResizeManagerService,
              private _el: ElementRef<HTMLElement>,
              private _appTranslation: AppLocalization) {
  }

  ngAfterViewInit() {
      this._columnsResizeManager.updateColumns(this._el.nativeElement);
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

