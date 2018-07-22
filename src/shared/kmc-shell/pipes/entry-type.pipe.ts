import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMediaType } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Pipe({name: 'entryType'})
export class EntryTypePipe implements PipeTransform {

	constructor(private appLocalization: AppLocalization) {
	}

	transform(value, isTooltip: boolean): string {
		let className = "";
		let tooltip = "";
		if (typeof(value) !== 'undefined' && value !== null) {
			switch (value) {
				case KalturaMediaType.video:
					className = 'kIconvideo-small';
					tooltip = this.appLocalization.get("applications.content.entryType.video");
					break;
				case KalturaMediaType.image:
					tooltip = this.appLocalization.get("applications.content.entryType.image");
					className = 'kIconimage-small';
					break;
				case KalturaMediaType.audio:
					tooltip = this.appLocalization.get("applications.content.entryType.audio");
					className = 'kIconsound-small';
					break;
				case KalturaMediaType.liveStreamFlash:
				case KalturaMediaType.liveStreamQuicktime:
				case KalturaMediaType.liveStreamRealMedia:
				case KalturaMediaType.liveStreamWindowsMedia:
					tooltip = this.appLocalization.get("applications.content.entryType.live");
					className = 'kIconlive_transcoding';
					break;
				default:
					tooltip = this.appLocalization.get("applications.content.entryType.unknown");
					className = 'kIconfile-small';
					break;
			}
		}
		if (isTooltip) {
			return tooltip;
		} else {
			return className;
		}
	}
}
