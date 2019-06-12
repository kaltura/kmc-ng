import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from 'app-shared/kmc-shared/date-format/date.pipe';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        DatePipe,
    ],
    exports: [
        DatePipe,
    ]
})
export class DateFormatModule {
}
