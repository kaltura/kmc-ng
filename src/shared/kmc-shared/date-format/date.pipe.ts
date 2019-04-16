import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { getLocaleDateString } from 'app-shared/kmc-shared/utils/get-locale-date-string';

@Pipe({
    name: 'kmcDate'
})
export class DatePipe implements PipeTransform {
    transform(date: number, format?: string): any {
        if (date) {
            if (!format) {
                format = 'dateAndTime';
            }

            switch (format) {
                case 'dateOnly':
                    format = getLocaleDateString();
                    break;
                case 'timeOnly':
                    format = 'HH:mm';
                    break;
                case 'dateAndTime':
                    format = `${getLocaleDateString()} HH:mm`;
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
