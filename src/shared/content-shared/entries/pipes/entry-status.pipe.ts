import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KalturaEntryModerationStatus } from 'kaltura-ngx-client/api/types/KalturaEntryModerationStatus';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';

@Pipe({ name: 'entryStatus' })
export class EntryStatusPipe implements PipeTransform {

  constructor(private appLocalization: AppLocalization) {
  }

  transform(entry: KalturaMediaEntry): string {
    let ret = '';
    const isLive = entry.mediaType === KalturaMediaType.liveStreamFlash ||
      entry.mediaType === KalturaMediaType.liveStreamQuicktime ||
      entry.mediaType === KalturaMediaType.liveStreamRealMedia ||
      entry.mediaType === KalturaMediaType.liveStreamWindowsMedia;
    if (typeof(entry) !== 'undefined' && entry !== null) {
      switch (entry.status.toString()) {
        case KalturaEntryStatus.errorImporting.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.errorImporting');
          break;
        case KalturaEntryStatus.errorConverting.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.errorConverting');
          break;
        case KalturaEntryStatus.scanFailure.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.scanFailure');
          break;
        case KalturaEntryStatus.import.toString():
          if (isLive) {
            ret = this.appLocalization.get('applications.content.entryStatus.provisioning');
          } else {
            ret = this.appLocalization.get('applications.content.entryStatus.import');
          }
          break;
        case KalturaEntryStatus.infected.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.infected');
          break;
        case KalturaEntryStatus.preconvert.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.preconvert');
          break;
        case KalturaEntryStatus.ready.toString():
          ret = this.getReadyState(entry);
          break;
        case KalturaEntryStatus.deleted.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.deleted');
          break;
        case KalturaEntryStatus.pending.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.pending');
          break;
        case KalturaEntryStatus.moderate.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.moderate');
          break;
        case KalturaEntryStatus.blocked.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.blocked');
          break;
        case KalturaEntryStatus.noContent.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.noContent');
          break;
      }
    }
    return ret;
  }

  getReadyState(entry: KalturaMediaEntry) {
    const SCHEDULING_ALL_OR_IN_FRAME = 1;
    const SCHEDULING_BEFORE_FRAME = 2;
    const SCHEDULING_AFTER_FRAME = 3;

    let result = '';
    const time = new Date();
    let schedulingType = 0;

    const undefinedDate = (date) => typeof date === 'undefined' || date < 0;

    if (
      (undefinedDate(entry.startDate) && undefinedDate(entry.endDate)) ||
      (entry.startDate <= time && entry.endDate >= time) ||
      (entry.startDate < time && undefinedDate(entry.endDate)) ||
      (undefinedDate(entry.startDate) && entry.endDate > time)
    ) {
      schedulingType = SCHEDULING_ALL_OR_IN_FRAME;
    } else if (entry.startDate > time) {
      schedulingType = SCHEDULING_BEFORE_FRAME;
    } else if (entry.endDate < time) {
      schedulingType = SCHEDULING_AFTER_FRAME;
    }

    const moderationStatus: number = entry.moderationStatus;
    switch (moderationStatus) {
      case KalturaEntryModerationStatus.approved:
      case KalturaEntryModerationStatus.autoApproved:
      case KalturaEntryModerationStatus.flaggedForReview:
        if (schedulingType === SCHEDULING_ALL_OR_IN_FRAME) {
          result = this.appLocalization.get('applications.content.entryStatus.ready');
        } else if (schedulingType === SCHEDULING_BEFORE_FRAME) {
          result = this.appLocalization.get('applications.content.entryStatus.scheduledStatus');
        } else if (schedulingType === SCHEDULING_AFTER_FRAME) {
          result = this.appLocalization.get('applications.content.entryStatus.finishedStatus');
        }
        break;
      case KalturaEntryModerationStatus.pendingModeration:
        result = this.appLocalization.get('applications.content.entryStatus.pendingStatus');
        break;

      case KalturaEntryModerationStatus.rejected:
        result = this.appLocalization.get('applications.content.entryStatus.rejectedStatus');
        break;

    }
    return result;
  }
}
