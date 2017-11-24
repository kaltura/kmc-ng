import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistRule } from '../rule-based-content-widget.service';
import { KalturaPlayableEntryOrderBy } from 'kaltura-typescript-client/types/KalturaPlayableEntryOrderBy';

@Pipe({ name: 'playlistRuleOrderBy' })
export class PlaylistOrderByPipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(rule: PlaylistRule = null): string {
    switch (rule.orderBy) {
      case KalturaPlayableEntryOrderBy.playsDesc.toString():
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostPlayed');

      case KalturaPlayableEntryOrderBy.recentDesc.toString():
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostRecent');

      case KalturaPlayableEntryOrderBy.rankDesc.toString():
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.highestRated');

      case KalturaPlayableEntryOrderBy.nameAsc.toString():
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.entryName');

      default:
        return '';
    }
  }
}
