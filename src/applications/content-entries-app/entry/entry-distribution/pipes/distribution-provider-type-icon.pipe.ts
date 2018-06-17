import { Pipe, PipeTransform } from '@angular/core';
import { KalturaDistributionProviderType } from 'kaltura-ngx-client';

@Pipe({ name: 'kEntriesDistributionProviderTypeIcon' })
export class DistributionProviderTypeIconPipe implements PipeTransform {

  transform(providerType: KalturaDistributionProviderType): string {
    let className;

    switch (true) {
      case KalturaDistributionProviderType.comcastMrss === providerType:
        className = 'comcast';
        break;

      case KalturaDistributionProviderType.dailymotion === providerType:
        className = 'dailymotion';
        break;

      case KalturaDistributionProviderType.doubleclick === providerType:
        className = 'doubleclick';
        break;

      case KalturaDistributionProviderType.facebook === providerType:
        className = 'facebook';
        break;

      case KalturaDistributionProviderType.freewheel === providerType:
      case KalturaDistributionProviderType.freewheelGeneric === providerType:
        className = 'freewheel';
        break;

      case KalturaDistributionProviderType.hulu === providerType:
        className = 'hulu';
        break;

      case KalturaDistributionProviderType.crossKaltura === providerType:
        className = 'kaltura';
        break;

      case KalturaDistributionProviderType.quickplay === providerType:
        className = 'quickplay';
        break;

      case KalturaDistributionProviderType.uverse === providerType:
      case KalturaDistributionProviderType.uverseClickToOrder === providerType:
      case KalturaDistributionProviderType.attUverse === providerType:
        className = 'uverse';
        break;

      case KalturaDistributionProviderType.yahoo === providerType:
        className = 'yahoo';
        break;

      case KalturaDistributionProviderType.youtube === providerType:
      case KalturaDistributionProviderType.youtubeApi === providerType:
        className = 'youtube';
        break;

      default:
        className = 'distribution';
        break;
    }

    return className;
  }
}
