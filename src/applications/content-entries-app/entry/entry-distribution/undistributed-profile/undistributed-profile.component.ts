import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KalturaDistributionProfile } from 'kaltura-ngx-client/api/types/KalturaDistributionProfile';

@Component({
  selector: 'kEntryUndistributedProfile',
  templateUrl: './undistributed-profile.component.html',
  styleUrls: ['./undistributed-profile.component.scss']
})
export class UndistributedProfileComponent {
  @Input() profile: KalturaDistributionProfile;

  @Output() onExport = new EventEmitter<KalturaDistributionProfile>();
}

