import { Component } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';

@Component({
  selector: 'k-transcoding-profiles-lists-holder',
  templateUrl: './transcoding-profiles-lists-holder.component.html',
  styleUrls: ['./transcoding-profiles-lists-holder.component.scss']
})
export class TranscodingProfilesListsHolderComponent {
  public _kalturaConversionProfileType = KalturaConversionProfileType;
}
