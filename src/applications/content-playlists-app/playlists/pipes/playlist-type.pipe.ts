import { Pipe, PipeTransform } from '@angular/core';
import { KalturaPlaylistType } from 'kaltura-typescript-client/types/KalturaPlaylistType';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

@Pipe({name: 'playlistType'})

export class PlaylistTypePipe implements PipeTransform {

	constructor(private appLocalization: AppLocalization) {
	}

	transform(value): string {
		let playlistType = "";
		if (typeof(value) !== 'undefined' && value !== null) {
			switch (value) {
				case KalturaPlaylistType.dynamic:
					playlistType = this.appLocalization.get("applications.content.playlistType.dynamic");
					break;
				case KalturaPlaylistType.external:
					playlistType = this.appLocalization.get("applications.content.playlistType.external");
					break;
				case KalturaPlaylistType.staticList:
					playlistType = this.appLocalization.get("applications.content.playlistType.staticList");
					break;
				default:
					playlistType = this.appLocalization.get("applications.content.playlistType.unknown");;
					break;
			}
		}
		return playlistType;
	}
}
