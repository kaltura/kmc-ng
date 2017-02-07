import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaEntryStatus, KalturaEntryModerationStatus, KalturaMediaType, KalturaMediaEntry } from '@kaltura-ng2/kaltura-api';

@Pipe({name: 'entryStatus'})
export class EntryStatusPipe implements PipeTransform {

    constructor(private appLocalization: AppLocalization) {
    }

    transform(entry: KalturaMediaEntry): string {
        let ret: string = '';
        const isLive = entry.mediaType == KalturaMediaType.LiveStreamFlash ||
                        entry.mediaType == KalturaMediaType.LiveStreamQuicktime ||
                        entry.mediaType == KalturaMediaType.LiveStreamRealMedia ||
                        entry.mediaType == KalturaMediaType.LiveStreamWindowsMedia;
        if (typeof(entry) !== 'undefined' && entry !== null) {
            switch (entry.status.toString()) {
                case KalturaEntryStatus.ErrorImporting.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.errorImporting");
                    break;
                case KalturaEntryStatus.ErrorConverting.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.errorConverting");
                    break;
                case KalturaEntryStatus.ScanFailure.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.scanFailure");
                    break;
                case KalturaEntryStatus.Import.toString():
                    if (isLive){
                        ret = this.appLocalization.get("applications.content.entryStatus.provisioning");
                    }else {
                        ret = this.appLocalization.get("applications.content.entryStatus.import");
                    }
                    break;
                case KalturaEntryStatus.Infected.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.infected");
                    break;
                case KalturaEntryStatus.Preconvert.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.preconvert");
                    break;
                case KalturaEntryStatus.Ready.toString():
                    ret = this.getReadyState(entry);
                    break;
                case KalturaEntryStatus.Deleted.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.deleted");
                    break;
                case KalturaEntryStatus.Pending.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.pending");
                    break;
                case KalturaEntryStatus.Moderate.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.moderate");
                    break;
                case KalturaEntryStatus.Blocked.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.blocked");
                    break;
                case KalturaEntryStatus.NoContent.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.noContent");
                    break;
            }
        }
        return ret;
    }

    getReadyState(entry: KalturaMediaEntry){
        const SCHEDULING_ALL_OR_IN_FRAME:number = 1;
        const SCHEDULING_BEFORE_FRAME:number = 2;
        const SCHEDULING_AFTER_FRAME:number = 3;

        let result: string = '';
        const now: Date = new Date();
        const time: number = now.getTime() / 1000;
        let schedulingType: number = 0;

        let undefinedDate = (date) => {return typeof date === 'undefined' || date < 0 };

        if (
            (undefinedDate(entry.startDate) && undefinedDate(entry.endDate)) ||
            (entry.startDate <= time && entry.endDate >= time) ||
            (entry.startDate < time && undefinedDate(entry.endDate)) ||
            (undefinedDate(entry.startDate) && entry.endDate > time)
            ) {
            schedulingType = SCHEDULING_ALL_OR_IN_FRAME;
        }
        else if (entry.startDate > time) {
            schedulingType = SCHEDULING_BEFORE_FRAME;
        }
        else if (entry.endDate < time) {
            schedulingType = SCHEDULING_AFTER_FRAME;
        }

        const moderationStatus: number = entry.moderationStatus;
        switch (moderationStatus) {
            case KalturaEntryModerationStatus.Approved:
            case KalturaEntryModerationStatus.AutoApproved:
            case KalturaEntryModerationStatus.FlaggedForReview:
                if (schedulingType == SCHEDULING_ALL_OR_IN_FRAME){
                    result = this.appLocalization.get("applications.content.entryStatus.ready");
                }
                else if (schedulingType == SCHEDULING_BEFORE_FRAME) {
                    result = this.appLocalization.get("applications.content.entryStatus.scheduledStatus");
                }
                else if (schedulingType == SCHEDULING_AFTER_FRAME) {
                    result = this.appLocalization.get("applications.content.entryStatus.finishedStatus");
                }
                break;
            case KalturaEntryModerationStatus.PendingModeration:
                result = this.appLocalization.get("applications.content.entryStatus.pendingStatus");
                break;

            case KalturaEntryModerationStatus.Rejected:
                result = this.appLocalization.get("applications.content.entryStatus.rejectedStatus");
                break;

        }
        return result;
    }
}
