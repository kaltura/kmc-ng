import {Pipe, PipeTransform} from '@angular/core';
import {AppLocalization} from '@kaltura-ng2/kaltura-common';

@Pipe({name: 'entryStatus'})
export class EntryStatusPipe implements PipeTransform {

    constructor(private appLocalization: AppLocalization) {
    }

    transform(value: string): string {
        let ret: string = '';
        // TODO [kmc] use the actual enum instead of strings
        if (typeof(value) !== 'undefined' && value !== null) {
            switch (value.toString()) {
                case '-2':
                    ret = this.appLocalization.get("applications.content.entryStatus.errorImporting");
                    break;
                case '-1':
                    ret = this.appLocalization.get("applications.content.entryStatus.errorConverting");
                    break;
                case 'virusScan.ScanFailure':
                    ret = this.appLocalization.get("applications.content.entryStatus.scanFailure");
                    break;
                case '0':
                    ret = this.appLocalization.get("applications.content.entryStatus.import");
                    break;
                case 'virusScan.Infected':
                    ret = this.appLocalization.get("applications.content.entryStatus.infected");
                    break;
                case '1':
                    ret = this.appLocalization.get("applications.content.entryStatus.preconvert");
                    break;
                case '2':
                    ret = this.appLocalization.get("applications.content.entryStatus.ready");
                    break;
                case '3':
                    ret = this.appLocalization.get("applications.content.entryStatus.deleted");
                    break;
                case '4':
                    ret = this.appLocalization.get("applications.content.entryStatus.pending");
                    break;
                case '5':
                    ret = this.appLocalization.get("applications.content.entryStatus.moderate");
                    break;
                case '6':
                    ret = this.appLocalization.get("applications.content.entryStatus.blocked");
                    break;
                case '7':
                    ret = this.appLocalization.get("applications.content.entryStatus.noContent");
                    break;
            }
        }
        return ret;
    }
}
