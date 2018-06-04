import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';
import { PlaylistRule } from '../playlist-rule/playlist-rule.interface';

@Pipe({ name: 'playlistRuleOrderBy' })
export class PlaylistOrderByPipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(rule: PlaylistRule = null): string {
    switch (true) {
      case KalturaPlayableEntryOrderBy.playsDesc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostPlayed');

      case KalturaPlayableEntryOrderBy.recentDesc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostRecent');

      case KalturaPlayableEntryOrderBy.rankDesc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.highestRated');

      case KalturaPlayableEntryOrderBy.nameAsc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.entryName');

      default:
        return '';
    }
  }
}
