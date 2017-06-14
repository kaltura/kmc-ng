import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaEntryModerationStatus } from 'kaltura-typescript-client/types/KalturaEntryModerationStatus';

@Pipe({name: 'moderation'})
export class ModerationPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: string): string {
		let moderationStatus: string = "";
		if (value) {
			switch (value.toString()) {
				case KalturaEntryModerationStatus.autoApproved.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.autoApprovedStatus");
					break;
				case KalturaEntryModerationStatus.flaggedForReview.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.flaggedStatus");
					break;
				case KalturaEntryModerationStatus.approved.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.approvedStatus");
					break;
				case KalturaEntryModerationStatus.pendingModeration.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.pendingStatus");
					break;
				case KalturaEntryModerationStatus.rejected.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.rejectedStatus");
					break;
			}
		}
		return moderationStatus;
	}
}
