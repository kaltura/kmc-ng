import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaDropFolderFileStatus } from 'kaltura-typescript-client/types/KalturaDropFolderFileStatus';

@Pipe({ name: 'kFolderFileStatus' })
export class FolderFileStatusPipe implements PipeTransform {
  constructor(
    private _appLocalization: AppLocalization
  ) {}

  transform(value: string, isIcon: boolean, isTooltip: boolean): string {
    let className = "",
        label = "",
        tooltip = "";
    if (typeof(value) !== 'undefined' && value !== null) {
      switch (parseInt(value)) {
        case KalturaDropFolderFileStatus.uploading:
          className = 'kIconSync kIconBlue';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.uploading");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.uploading");
          break;
        case KalturaDropFolderFileStatus.downloading:
          className = 'kIconSync kIconBlue';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.downloading");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.downloading");
          break;
        case KalturaDropFolderFileStatus.pending:
          className = 'kIconUpload2 kIconOrange';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.pending");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.pending");
          break;
        case KalturaDropFolderFileStatus.processing:
          className = 'kIconSync kIconBlue';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.processing");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.processing");
          break;
        case KalturaDropFolderFileStatus.parsed:
          className = 'kIconUpload2 kIconOrange';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.parsedFromXml");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.parsedFromXml");
          break;
        case KalturaDropFolderFileStatus.waiting:
          className = 'kIconUpload2 kIconOrange';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.waitingForRelatedFiles");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.waitingForRelatedFiles");
          break;
        case KalturaDropFolderFileStatus.noMatch:
          className = 'kIconUpload2 kIconOrange';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.waitingForMatchedEntry");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.waitingForMatchedEntry");
          break;
        case KalturaDropFolderFileStatus.errorHandling:
          className = 'kIconError kIconRed';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.error");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.error");
          break;
        case KalturaDropFolderFileStatus.errorDeleting:
          className = 'kIconError kIconRed';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.deleteFailed");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.deleteFailed");
          break;
        case KalturaDropFolderFileStatus.handled:
          className = 'kIconComplete kIconGreen';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.done");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.done");
          break;
        case KalturaDropFolderFileStatus.errorDownloading:
          className = 'kIconError kIconRed';
          label = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusLabels.downloadFailed");
          tooltip = this._appLocalization.get("applications.content.dropFolders.dropFolderStatusTooltips.downloadFailed");
          break;
        default:
          className = 'kIconUnknown kIconRed';
          label = this._appLocalization.get("applications.content.dropFolders.table.unknown");
          tooltip = this._appLocalization.get("applications.content.dropFolders.table.unknown");
          break;
      }
    }
    if(isIcon) {
      return className;
    } else if(isTooltip) {
      return tooltip;
    } else {
      return label;
    }
  }
}
