import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { BrowserService } from 'app-shared/kmc-shell/providers';

@Pipe({
    name: 'kmcDate'
})
export class DatePipe implements PipeTransform {
    constructor(private _browserService: BrowserService) {

    }

    transform(date: number, format?: string): any {
        if (date) {
            if (!format) {
                format = 'dateAndTime';
            }

            switch (format) {
                case 'dateOnly':
                    format = this._browserService.getCurrentDateFormat();
                    break;
                case 'timeOnly':
                    format = 'HH:mm';
                    break;
                case 'dateAndTime':
                    format = `${this._browserService.getCurrentDateFormat()} HH:mm`;
                    break;
                case 'longDateOnly':
                    format = 'MMMM D, YYYY';
                    break;
                default:
                    break;
            }


            return moment(date).format(format);
        } else {
            return '';
        }
    }
}
