import {Pipe, PipeTransform} from '@angular/core';
import {AppLocalization} from '@kaltura-ng2/kaltura-common';

import { EntryStatus } from '../entries-store/entries-store.service';

@Pipe({name: 'entryStatus'})
export class EntryStatusPipe implements PipeTransform {

    constructor(private appLocalization: AppLocalization) {
    }

    transform(value: string): string {
        let ret: string = '';
        if (typeof(value) !== 'undefined' && value !== null) {
            switch (value.toString()) {
                case EntryStatus.ErrorImporting:
                    ret = this.appLocalization.get("applications.content.entryStatus.errorImporting");
                    break;
                case EntryStatus.ErrorConverting:
                    ret = this.appLocalization.get("applications.content.entryStatus.errorConverting");
                    break;
                case EntryStatus.ScanFailure:
                    ret = this.appLocalization.get("applications.content.entryStatus.scanFailure");
                    break;
                case EntryStatus.Import:
                    ret = this.appLocalization.get("applications.content.entryStatus.import");
                    break;
                case EntryStatus.Infected:
                    ret = this.appLocalization.get("applications.content.entryStatus.infected");
                    break;
                case EntryStatus.PreConvert:
                    ret = this.appLocalization.get("applications.content.entryStatus.preconvert");
                    break;
                case EntryStatus.Ready:
                    ret = this.appLocalization.get("applications.content.entryStatus.ready");
                    break;
                case EntryStatus.Deleted:
                    ret = this.appLocalization.get("applications.content.entryStatus.deleted");
                    break;
                case EntryStatus.Pending:
                    ret = this.appLocalization.get("applications.content.entryStatus.pending");
                    break;
                case EntryStatus.Moderate:
                    ret = this.appLocalization.get("applications.content.entryStatus.moderate");
                    break;
                case EntryStatus.Blocked:
                    ret = this.appLocalization.get("applications.content.entryStatus.blocked");
                    break;
                case EntryStatus.NoContent:
                    ret = this.appLocalization.get("applications.content.entryStatus.noContent");
                    break;
            }
        }
        return ret;
    }
}
