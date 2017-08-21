import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

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
					className = 'kIconvideo';
					tooltip = this.appLocalization.get("applications.content.entryType.video");
					break;
				case KalturaMediaType.image:
					tooltip = this.appLocalization.get("applications.content.entryType.image");
					className = 'kIconimage';
					break;
				case KalturaMediaType.audio:
					tooltip = this.appLocalization.get("applications.content.entryType.audio");
					className = 'kIconsound';
					break;
				case KalturaMediaType.liveStreamFlash:
				case KalturaMediaType.liveStreamQuicktime:
				case KalturaMediaType.liveStreamRealMedia:
				case KalturaMediaType.liveStreamWindowsMedia:
					tooltip = this.appLocalization.get("applications.content.entryType.live");
					className = 'kIconLive';
					break;
				default:
					tooltip = this.appLocalization.get("applications.content.entryType.unknown");
					className = 'kIconUnknown';
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
