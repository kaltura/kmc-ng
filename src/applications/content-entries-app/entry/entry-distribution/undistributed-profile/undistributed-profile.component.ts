import { Component, Input } from '@angular/core';
import { KalturaDistributionProfile } from 'kaltura-ngx-client/api/types/KalturaDistributionProfile';

@Component({
  selector: 'kEntryUndistributedProfile',
  templateUrl: './undistributed-profile.component.html',
  styleUrls: ['./undistributed-profile.component.scss']
})
export class UndistributedProfileComponent {
  @Input() profile: KalturaDistributionProfile;
}

