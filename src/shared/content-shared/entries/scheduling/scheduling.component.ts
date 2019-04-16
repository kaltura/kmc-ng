import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { modulesConfig } from 'config/modules';
import { subApplicationsConfig } from 'config/sub-applications';
import { getCalendarFormat } from 'app-shared/kmc-shared/utils/get-locale-date-string';

@Component({
  selector: 'kScheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss']
})
export class SchedulingComponent implements OnInit, OnDestroy {
  @Input() hideClearDates: boolean;
  @Input()
  set schedulingForm(form: FormGroup) {
    this._schedulingForm = form;
    const controls = form.controls;
    const isValidForm = controls.enableEndDate && controls.endDate && controls.startDate && controls.scheduling;
    if (!isValidForm) {
      console.error('Invalid scheduling form structure received. Verify form includes: startDate, endDate, scheduling and enableEndDate form controls.');
    }
  }

  get schedulingForm(): FormGroup {
    return this._schedulingForm;
  }

  @Output() clearDates = new EventEmitter();

    public _calendarFormat = getCalendarFormat();
  public _schedulingForm: FormGroup;
  public _timeZone: any = {};
  public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;

  constructor() {
  }

  ngOnInit() {
    this.getTimeZone();
  }

  ngOnDestroy() {

  }

  public _clearDates() {
    this.clearDates.emit();
  }

  private getTimeZone() {
    const now: any = new Date();
    const zoneTimeOffset: number = (now.getTimezoneOffset() / 60) * (-1);
    const ztStr: string = (zoneTimeOffset === 0) ? '' : (zoneTimeOffset > 0) ? ('+' + zoneTimeOffset) : (zoneTimeOffset.toString());
    this._timeZone = { 0: ztStr };
  }

}

