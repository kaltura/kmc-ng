import {Pipe, PipeTransform} from '@angular/core';
import {KalturaPlaylist, KalturaPlaylistType} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {PlaylistsUtilsService} from "../../playlists-utils.service";

@Pipe({name: 'playlistType'})

export class PlaylistTypePipe implements PipeTransform {
    
    constructor(
        private appLocalization: AppLocalization,
        private _playlistsUtilsService: PlaylistsUtilsService) {
    }
    
    transform(value: KalturaPlaylist, isIcon: boolean): string {
        let className = "",
            playlistType = "";
        if (typeof (value) !== 'undefined' && value !== null) {
            switch (value.playlistType) {
                case KalturaPlaylistType.dynamic:
                    className = 'kIconPlaylist_RuleBased';
                    playlistType = this.appLocalization.get("applications.content.playlistType.dynamic");
                    break;
                case KalturaPlaylistType.external:
                    className = 'kIconPlaylist_RuleBased';
                    playlistType = this.appLocalization.get("applications.content.playlistType.external");
                    break;
                case KalturaPlaylistType.staticList:
                    className = 'kIconPlaylist_Manual';
                    playlistType = this.appLocalization.get("applications.content.playlistType.staticList");
                    break;
                default:
                    className = 'kIconUnknown';
                    playlistType = this.appLocalization.get("applications.content.playlistType.unknown");
                    break;
            }
        }
        if (this._playlistsUtilsService.isRapt(value)){
            className = 'kIconfeed'; /* TODO [kmc] update icon once ready */
            playlistType = this.appLocalization.get("applications.content.playlistType.interactive");
        }
        return isIcon ? className : playlistType;
    }
}
