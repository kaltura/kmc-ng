import {  Injectable } from '@angular/core';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { FormManager } from '@kaltura-ng2/kaltura-ui'
import { PlaylistStore } from './playlist-store.service';

@Injectable()
export class PlaylistFormManager extends FormManager<KalturaPlaylist>
{
    private _playlistStore : PlaylistStore;

    constructor()
    {
        super();
    }

    set playlistStore(value : PlaylistStore)
    {
       this._playlistStore = value;
    }

    public returnToPlaylists() : void{
        if (this._playlistStore) {
            this._playlistStore.returnToPlaylists();
        }
    }
}
