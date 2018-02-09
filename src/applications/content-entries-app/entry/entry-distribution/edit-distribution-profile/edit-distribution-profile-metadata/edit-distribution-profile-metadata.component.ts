import { Component, Input } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';

@Component({
  selector: 'kEditDistributionProfileMetadata',
  templateUrl: './edit-distribution-profile-metadata.component.html',
  styleUrls: ['./edit-distribution-profile-metadata.component.scss']
})
export class EditDistributionProfileMetadataComponent {
  @Input() entry: KalturaMediaEntry;
}

