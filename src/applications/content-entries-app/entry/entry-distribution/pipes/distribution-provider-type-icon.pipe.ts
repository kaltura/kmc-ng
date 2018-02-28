import { Pipe, PipeTransform } from '@angular/core';
import { KalturaDistributionProviderType } from 'kaltura-ngx-client/api/types/KalturaDistributionProviderType';

@Pipe({ name: 'kEntriesDistributionProviderTypeIcon' })
export class DistributionProviderTypeIconPipe implements PipeTransform {

  transform(providerType: KalturaDistributionProviderType): string {
    let className;

    switch (true) {
      case KalturaDistributionProviderType.comcastMrss.equals(providerType):
        className = 'comcast';
        break;

      case KalturaDistributionProviderType.dailymotion.equals(providerType):
        className = 'dailymotion';
        break;

      case KalturaDistributionProviderType.doubleclick.equals(providerType):
        className = 'doubleclick';
        break;

      case KalturaDistributionProviderType.facebook.equals(providerType):
        className = 'facebook';
        break;

      case KalturaDistributionProviderType.freewheel.equals(providerType):
      case KalturaDistributionProviderType.freewheelGeneric.equals(providerType):
        className = 'freewheel';
        break;

      case KalturaDistributionProviderType.hulu.equals(providerType):
        className = 'hulu';
        break;

      case KalturaDistributionProviderType.crossKaltura.equals(providerType):
        className = 'kaltura';
        break;

      case KalturaDistributionProviderType.quickplay.equals(providerType):
        className = 'quickplay';
        break;

      case KalturaDistributionProviderType.uverse.equals(providerType):
      case KalturaDistributionProviderType.uverseClickToOrder.equals(providerType):
      case KalturaDistributionProviderType.attUverse.equals(providerType):
        className = 'uverse';
        break;

      case KalturaDistributionProviderType.yahoo.equals(providerType):
        className = 'yahoo';
        break;

      case KalturaDistributionProviderType.youtube.equals(providerType):
      case KalturaDistributionProviderType.youtubeApi.equals(providerType):
        className = 'youtube';
        break;

      default:
        className = 'distribution';
        break;
    }

    return className;
  }
}
