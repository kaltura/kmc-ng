import {Pipe, PipeTransform} from '@angular/core';
import {KalturaSyndicationFeedType} from 'kaltura-ngx-client';

@Pipe({name: 'kDestinationIcon'})
export class DestinationIconPipe implements PipeTransform {
  constructor() {
  }

  transform(value: KalturaSyndicationFeedType): string {
    switch (value) {
      case KalturaSyndicationFeedType.googleVideo:
        return 'kIconGoogle';
      case KalturaSyndicationFeedType.yahoo:
        return 'kIconYahoo';
      case KalturaSyndicationFeedType.itunes:
        return 'kIconITunes';
      case KalturaSyndicationFeedType.rokuDirectPublisher:
        return 'kIconRoku';
      case KalturaSyndicationFeedType.operaTvSnap:
        return 'kIconOpera';
      case KalturaSyndicationFeedType.kalturaXslt:
        // handled by DestinationLabelPipe since we need to show text and not icon
        return '';
      default:
        return '';
    }
  }
}
