import {Pipe, PipeTransform} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {SortDirection} from '../playlists-store/playlists-store.service';


@Pipe({name: 'kPlaylistsTableSortDirectionPipe'})
export class PlaylistsTableSortDirectionPipe implements PipeTransform {
    constructor(private appLocalization: AppLocalization) {
    }

    transform(value: SortDirection): number {
        switch (value) {
            case SortDirection.Asc:
                return 1;
            case SortDirection.Desc:
                return -1;
        }
    }
}
