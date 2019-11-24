import {Pipe, PipeTransform} from '@angular/core';
import {KalturaPlaylist, KalturaPlaylistType} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';

@Pipe({name: 'playlistType'})

export class PlaylistTypePipe implements PipeTransform {
    
    constructor(private appLocalization: AppLocalization) {
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
        if (value.adminTags && value.adminTags.split(',').indexOf('raptentry') > -1){
            className = 'kIconfeed'; /* TODO [kmc] update icon once ready */
            playlistType = this.appLocalization.get("applications.content.playlistType.interactive");
        }
        return isIcon ? className : playlistType;
    }
}
