import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaMediaType, KalturaMediaEntry } from '@kaltura-ng2/kaltura-api';

@Pipe({name: 'entryDuration'})
export class EntryDurationPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: string, entry: KalturaMediaEntry = null): string {
	let duration = value;
	if (entry && entry instanceof KalturaMediaEntry && entry.mediaType){
  		const type = entry.mediaType.toString();
		if (type === KalturaMediaType.LiveStreamFlash.toString() ||
				type === KalturaMediaType.LiveStreamQuicktime.toString() ||
				type === KalturaMediaType.LiveStreamRealMedia.toString() ||
				type === KalturaMediaType.LiveStreamWindowsMedia.toString()
		){
			duration = this.appLocalization.get('app.common.n_a');
		}
    }
    return duration;
  }
}
