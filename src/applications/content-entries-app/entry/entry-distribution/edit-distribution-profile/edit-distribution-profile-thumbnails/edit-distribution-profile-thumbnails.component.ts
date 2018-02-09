import { Component, Input } from '@angular/core';
import { ExtendedKalturaDistributionThumbDimensions } from '../edit-distribution-profile-thumbnails.component';

@Component({
  selector: 'kEditDistributionProfileThumbnails',
  templateUrl: './edit-distribution-profile-thumbnails.component.html',
  styleUrls: ['./edit-distribution-profile-thumbnails.component.scss']
})
export class EditDistributionProfileThumbnailsComponent {
  @Input() requiredThumbnails: ExtendedKalturaDistributionThumbDimensions[] | null = [];
}

