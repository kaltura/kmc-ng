import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

// TODO move to shared folder (duplicate of content-entries-app/shared/pipes/entry-type.pipe.ts)

@Pipe({ name: 'entryType' })
export class EntryTypePipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value, isTooltip: boolean): string {
    let className = '';
    let tooltip = '';
    if (typeof(value) !== 'undefined' && value !== null) {
      switch (value) {
        case KalturaMediaType.video:
          className = 'kIconvideo';
          tooltip = this._appLocalization.get('applications.content.entryType.video');
          break;
        case KalturaMediaType.image:
          tooltip = this._appLocalization.get('applications.content.entryType.image');
          className = 'kIconimage';
          break;
        case KalturaMediaType.audio:
          tooltip = this._appLocalization.get('applications.content.entryType.audio');
          className = 'kIconsound';
          break;
        case KalturaMediaType.liveStreamFlash:
        case KalturaMediaType.liveStreamQuicktime:
        case KalturaMediaType.liveStreamRealMedia:
        case KalturaMediaType.liveStreamWindowsMedia:
          tooltip = this._appLocalization.get('applications.content.entryType.live');
          className = 'kIconLive';
          break;
        default:
          tooltip = this._appLocalization.get('applications.content.entryType.unknown');
          className = 'kIconUnknown';
          break;
      }
    }

    return isTooltip ? tooltip : className;
  }
}
