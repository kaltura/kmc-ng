import { Pipe, PipeTransform } from '@angular/core';
import { KalturaDistributionProviderType } from 'kaltura-ngx-client/api/types/KalturaDistributionProviderType';

@Pipe({ name: 'kEntriesDistributionProviderTypeIcon' })
export class DistributionProviderTypeIconPipe implements PipeTransform {

  transform(providerType: KalturaDistributionProviderType): string {
    let fileName;

    switch (true) {
      case KalturaDistributionProviderType.comcastMrss.equals(providerType):
        fileName = 'comcast';
        break;

      case KalturaDistributionProviderType.dailymotion.equals(providerType):
        fileName = 'dailymotion';
        break;

      case KalturaDistributionProviderType.doubleclick.equals(providerType):
        fileName = 'doubleclick';
        break;

      case KalturaDistributionProviderType.facebook.equals(providerType):
        fileName = 'facebook';
        break;

      case KalturaDistributionProviderType.freewheel.equals(providerType):
      case KalturaDistributionProviderType.freewheelGeneric.equals(providerType):
        fileName = 'freewheel';
        break;

      case KalturaDistributionProviderType.hulu.equals(providerType):
        fileName = 'hulu';
        break;

      case KalturaDistributionProviderType.crossKaltura.equals(providerType):
        fileName = 'kaltura';
        break;

      case KalturaDistributionProviderType.quickplay.equals(providerType):
        fileName = 'quickplay';
        break;

      case KalturaDistributionProviderType.uverse.equals(providerType):
      case KalturaDistributionProviderType.uverseClickToOrder.equals(providerType):
      case KalturaDistributionProviderType.attUverse.equals(providerType):
        fileName = 'uverse';
        break;

      case KalturaDistributionProviderType.yahoo.equals(providerType):
        fileName = 'yahoo';
        break;

      case KalturaDistributionProviderType.youtube.equals(providerType):
      case KalturaDistributionProviderType.youtubeApi.equals(providerType):
        fileName = 'youtube';
        break;

      default:
        fileName = 'distribution';
        break;
    }

    return `/assets/distribution connectors/${fileName}.svg`;
  }
}
