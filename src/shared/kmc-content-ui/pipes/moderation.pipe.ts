import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaEntryModerationStatus } from '@kaltura-ng2/kaltura-api/types';

@Pipe({name: 'moderation'})
export class ModerationPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: string): string {
		let moderationStatus: string = "";
		if (value) {
			switch (value.toString()) {
				case KalturaEntryModerationStatus.AutoApproved.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.autoApprovedStatus");
					break;
				case KalturaEntryModerationStatus.FlaggedForReview.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.flaggedStatus");
					break;
				case KalturaEntryModerationStatus.Approved.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.approvedStatus");
					break;
				case KalturaEntryModerationStatus.PendingModeration.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.pendingStatus");
					break;
				case KalturaEntryModerationStatus.Rejected.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.rejectedStatus");
					break;
			}
		}
		return moderationStatus;
	}
}
