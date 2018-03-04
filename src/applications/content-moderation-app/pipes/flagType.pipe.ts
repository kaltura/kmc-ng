import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaModerationFlagType } from 'kaltura-ngx-client/api/types/KalturaModerationFlagType';

@Pipe({ name: 'kFlagType' })
export class FlagTypePipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: string): string {
    let flagType = '';
    if (value) {
      switch (value) {
        case KalturaModerationFlagType.sexualContent:
          flagType = this.appLocalization.get('applications.content.moderation.sexualContent');
          break;
        case KalturaModerationFlagType.harmfulDangerous:
          flagType = this.appLocalization.get('applications.content.moderation.harmfulOrDangerousAct');
          break;
        case KalturaModerationFlagType.spamCommercials:
          flagType = this.appLocalization.get('applications.content.moderation.spamOrCommercials');
          break;
        case KalturaModerationFlagType.violentRepulsive:
          flagType = this.appLocalization.get('applications.content.moderation.violentOrRepulsive');
          break;
      }
    }
    return flagType;
  }
}
