import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMediaType } from '@kaltura-ng2/kaltura-api/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

@Pipe({name: 'entryType'})
export class EntryTypePipe implements PipeTransform {

	constructor(private appLocalization: AppLocalization) {
	}

	transform(value, isTooltip: boolean): string {
		let className = 'k-entry-';
		let tooltip = "";
		if (typeof(value) !== 'undefined' && value !== null) {
			switch (value) {
				case KalturaMediaType.Video:
					className += 'media';
					tooltip = this.appLocalization.get("applications.content.entryType.video");
					break;
				case KalturaMediaType.Image:
					tooltip = this.appLocalization.get("applications.content.entryType.image");
					className += 'image';
					break;
				case KalturaMediaType.Audio:
					tooltip = this.appLocalization.get("applications.content.entryType.audio");
					className += 'audio';
					break;
				case KalturaMediaType.LiveStreamFlash:
				case KalturaMediaType.LiveStreamQuicktime:
				case KalturaMediaType.LiveStreamRealMedia:
				case KalturaMediaType.LiveStreamWindowsMedia:
					tooltip = this.appLocalization.get("applications.content.entryType.live");
					className += 'live';
					break;
				default:
					tooltip = this.appLocalization.get("applications.content.entryType.unknown");
					className += 'unknown';
					break;
			}
		}
		if (isTooltip) {
			return tooltip;
		}else {
			return className;
		}
	}
}
