import { Component, Input } from '@angular/core';
import { ExtendedKalturaEntryDistribution } from '../entry-distribution-widget.service';

@Component({
  selector: 'kEntryDistributedProfile',
  templateUrl: './distributed-profile.component.html',
  styleUrls: ['./distributed-profile.component.scss']
})
export class DistributedProfileComponent {
  @Input() profile: ExtendedKalturaEntryDistribution;
}

