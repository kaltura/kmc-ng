import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMediaType } from 'kaltura-typescript-client/types';
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
				case KalturaMediaType.video:
					className += 'media';
					tooltip = this.appLocalization.get("applications.content.entryType.video");
					break;
				case KalturaMediaType.image:
					tooltip = this.appLocalization.get("applications.content.entryType.image");
					className += 'image';
					break;
				case KalturaMediaType.audio:
					tooltip = this.appLocalization.get("applications.content.entryType.audio");
					className += 'audio';
					break;
				case KalturaMediaType.liveStreamFlash:
				case KalturaMediaType.liveStreamQuicktime:
				case KalturaMediaType.liveStreamRealMedia:
				case KalturaMediaType.liveStreamWindowsMedia:
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
