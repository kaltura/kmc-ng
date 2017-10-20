import { AfterViewInit, Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaDropFolderFileStatus } from 'kaltura-typescript-client/types/KalturaDropFolderFileStatus';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { DropFoldersService } from 'applications/content-drop-folders-app/drop-folders-list/drop-folders.service';

@Component({
  selector: 'kStatusesFilter',
  templateUrl: './statuses-filter.component.html',
  styleUrls: ['./statuses-filter.component.scss']
})

export class StatusesFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onNodeSelect: EventEmitter<any> = new EventEmitter();
  @Output() onNodeUnselect: EventEmitter<any> = new EventEmitter();
  statuses: TreeNode[];
  selectedStatuses: TreeNode[];

  constructor(
    private _appLocalization: AppLocalization,
    private _dropFoldersService: DropFoldersService
  ) {}

  _clearAll(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
    this._dropFoldersService.reload({ statuses: null});
  }

  close(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

  ngOnInit() {
    this.statuses = [{
      "label": this._appLocalization.get("applications.content.dropFolders.allStatuses"),
      "children": [
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.parsedFromXml"),
          "data": KalturaDropFolderFileStatus.parsed
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.uploading"),
          "data": `${KalturaDropFolderFileStatus.uploading}, ${KalturaDropFolderFileStatus.detected}`
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.pending"),
          "data": KalturaDropFolderFileStatus.pending
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.waitingForRelatedFiles"),
          "data": KalturaDropFolderFileStatus.waiting
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.waitingForMatchedEntry"),
          "data": KalturaDropFolderFileStatus.noMatch
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.processing"),
          "data": KalturaDropFolderFileStatus.processing
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.downloading"),
          "data": KalturaDropFolderFileStatus.downloading
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.done"),
          "data": KalturaDropFolderFileStatus.handled
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.error"),
          "data": KalturaDropFolderFileStatus.errorHandling
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.downloadFailed"),
          "data": KalturaDropFolderFileStatus.errorDownloading
        },
        {
          "label": this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.deleteFailed"),
          "data": KalturaDropFolderFileStatus.errorDeleting
        }
      ]
    }];
  }

  ngAfterViewInit() {}

  ngOnDestroy() {}
}

