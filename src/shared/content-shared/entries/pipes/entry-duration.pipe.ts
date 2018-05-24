import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaExternalMediaEntry } from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';

@Pipe({ name: 'entryDuration' })
export class EntryDurationPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: string, entry: KalturaMediaEntry = null): string {
    let duration = value;
    if (entry && entry instanceof KalturaExternalMediaEntry && !entry.duration) {
      duration = this.appLocalization.get('app.common.n_a');
    } else if (entry && entry instanceof KalturaMediaEntry && entry.mediaType) {
      const type = entry.mediaType.toString();
      if (type === KalturaMediaType.liveStreamFlash.toString() ||
        type === KalturaMediaType.liveStreamQuicktime.toString() ||
        type === KalturaMediaType.liveStreamRealMedia.toString() ||
        type === KalturaMediaType.liveStreamWindowsMedia.toString()
      ) {
        duration = this.appLocalization.get('app.common.n_a');
      }
    }
    return duration;
  }
}
