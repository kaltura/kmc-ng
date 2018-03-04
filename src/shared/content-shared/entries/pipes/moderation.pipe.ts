import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaEntryModerationStatus } from 'kaltura-ngx-client/api/types/KalturaEntryModerationStatus';

@Pipe({name: 'kModerationStatus'})
export class ModerationPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: KalturaEntryModerationStatus): string {
		let moderationStatus: string = "";
		if (value) {
			switch (value) {
				case KalturaEntryModerationStatus.autoApproved:
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.autoApprovedStatus");
          break;
				case KalturaEntryModerationStatus.flaggedForReview:
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.flaggedStatus");
					break;
				case KalturaEntryModerationStatus.approved:
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.approvedStatus");
					break;
				case KalturaEntryModerationStatus.pendingModeration:
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.pendingStatus");
					break;
				case KalturaEntryModerationStatus.rejected:
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.rejectedStatus");
					break;
			}
		}
		return moderationStatus;
	}
}
