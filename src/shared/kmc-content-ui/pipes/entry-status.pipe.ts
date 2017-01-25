import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaEntryStatus } from '@kaltura-ng2/kaltura-api';

@Pipe({name: 'entryStatus'})
export class EntryStatusPipe implements PipeTransform {

    constructor(private appLocalization: AppLocalization) {
    }

    transform(value: string): string {
        let ret: string = '';
        if (typeof(value) !== 'undefined' && value !== null) {
            switch (value.toString()) {
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
                    ret = this.appLocalization.get("applications.content.entryStatus.import");
                    break;
                case KalturaEntryStatus.Infected.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.infected");
                    break;
                case KalturaEntryStatus.Preconvert.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.preconvert");
                    break;
                case KalturaEntryStatus.Ready.toString():
                    ret = this.appLocalization.get("applications.content.entryStatus.ready");
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
}
