import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { AppLocalization } from '../../../../../kaltura-ng/kaltura-common/dist/index';
import { KalturaDropFolderFileStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileStatus';

@Component({
  selector: 'kStatusesFilter',
  templateUrl: './statuses-filter.component.html',
  styleUrls: ['./statuses-filter.component.scss']
})

export class StatusesFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() onNodeSelect: EventEmitter<any> = new EventEmitter();
  @Output() onNodeUnselect: EventEmitter<any> = new EventEmitter();
  public _selectedStatuses: TreeNode[];
  public _statuses: TreeNode[];

  constructor(private _appLocalization: AppLocalization) {
  }

  resetFilters(): void {
    this._selectedStatuses = [];
  }

  ngOnInit() {
    this._statuses = [{
      'label': this._appLocalization.get('applications.content.dropFolders.allStatuses'),
      'children': [
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.parsedFromXml'),
          'data': KalturaDropFolderFileStatus.parsed
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.uploading'),
          'data': `${KalturaDropFolderFileStatus.uploading}, ${KalturaDropFolderFileStatus.detected}`
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.pending'),
          'data': KalturaDropFolderFileStatus.pending
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.waitingForRelatedFiles'),
          'data': KalturaDropFolderFileStatus.waiting
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.waitingForMatchedEntry'),
          'data': KalturaDropFolderFileStatus.noMatch
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.processing'),
          'data': KalturaDropFolderFileStatus.processing
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.downloading'),
          'data': KalturaDropFolderFileStatus.downloading
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.done'),
          'data': KalturaDropFolderFileStatus.handled
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.error'),
          'data': KalturaDropFolderFileStatus.errorHandling
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.downloadFailed'),
          'data': KalturaDropFolderFileStatus.errorDownloading
        },
        {
          'label': this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.deleteFailed'),
          'data': KalturaDropFolderFileStatus.errorDeleting
        }
      ]
    }];
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }
}

