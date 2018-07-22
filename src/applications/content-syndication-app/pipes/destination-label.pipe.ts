import {Pipe, PipeTransform} from '@angular/core';
import {KalturaSyndicationFeedType} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Pipe({name: 'kDestinationLabel'})
export class DestinationLabelPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: KalturaSyndicationFeedType): string {
    if (value === KalturaSyndicationFeedType.kalturaXslt) {
      return this.appLocalization.get('applications.content.syndication.table.flexibleFormatFeed');
    }
    return null;
  }
}
