import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMediaType } from '@kaltura-ng2/kaltura-api';

@Pipe({name: 'entryType'})
export class EntryTypePipe implements PipeTransform {
  transform(value): string {
    let className = 'k-entry-';
    if (typeof(value) !== 'undefined' && value !== null)  {
      switch (value) {
        case KalturaMediaType.Video:
          className += 'media';
          break;
        case KalturaMediaType.Image:
          className += 'image';
          break;
        case KalturaMediaType.Audio:
          className += 'audio';
          break;
        case KalturaMediaType.LiveStreamFlash:
        case KalturaMediaType.LiveStreamQuicktime:
        case KalturaMediaType.LiveStreamRealMedia:
        case KalturaMediaType.LiveStreamWindowsMedia:
          className += 'live';
          break;
        default:
          className += 'unknown';
          break;
      }
    }
    return className;
  }
}
