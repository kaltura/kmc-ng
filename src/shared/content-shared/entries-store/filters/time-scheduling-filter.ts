import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';
import { FilterItem } from '../filter-item';

export class TimeSchedulingFilter extends ValueFilter<string> {

  static filterType = "TimeScheduling"; // IMPORTANT: you must have a static filterType property that is used at runtime
  private _scheduledBefore: Date;
  private _scheduledAfter: Date;

  public get scheduledAfter(): Date {
    return this._scheduledAfter;
  }

  public get scheduledBefore(): Date {
    return this._scheduledBefore;
  }

  constructor(value: string, label: string, scheduledTo?: Date, scheduledFrom?: Date) {
    super(label, value, { token: 'applications.content.filters.scheduling', args: { '0': value } });
    this._scheduledAfter = scheduledFrom;
    this._scheduledBefore = scheduledTo;
  }

  public isEqual(otherFilter: FilterItem): boolean {
    return super.isEqual(otherFilter)
      && otherFilter instanceof TimeSchedulingFilter
      && this._scheduledBefore === otherFilter._scheduledBefore
      && this._scheduledAfter === otherFilter._scheduledAfter;
  }
}

EntriesStore.registerFilterType(TimeSchedulingFilter, (items, request) => {

  items.forEach((item: TimeSchedulingFilter) => {
    switch (item.value) {
      case 'past':
        if (request.filter.endDateLessThanOrEqual === undefined || request.filter.endDateLessThanOrEqual < (new Date())) {
          request.filter.endDateLessThanOrEqual = (new Date());
        }
        break;
      case 'live':
        if (request.filter.startDateLessThanOrEqualOrNull === undefined || request.filter.startDateLessThanOrEqualOrNull > (new Date())) {
          request.filter.startDateLessThanOrEqualOrNull = (new Date());
        }
        if (request.filter.endDateGreaterThanOrEqualOrNull === undefined || request.filter.endDateGreaterThanOrEqualOrNull < (new Date())) {
          request.filter.endDateGreaterThanOrEqualOrNull = (new Date());
        }
        break;
      case 'future':
        if (request.filter.startDateGreaterThanOrEqual === undefined || request.filter.startDateGreaterThanOrEqual > (new Date())) {
          request.filter.startDateGreaterThanOrEqual = (new Date());
        }
        break;
      case 'scheduled':
        if (item.scheduledAfter) {
          if (request.filter.startDateGreaterThanOrEqual === undefined
            || request.filter.startDateGreaterThanOrEqual > (KalturaUtils.getStartDateValue(item.scheduledAfter))
          ) {
            request.filter.startDateGreaterThanOrEqual = (KalturaUtils.getStartDateValue(item.scheduledAfter));
          }
        }

        if (item.scheduledBefore) {
          if (request.filter.endDateLessThanOrEqual === undefined
            || request.filter.endDateLessThanOrEqual < (KalturaUtils.getEndDateValue(item.scheduledBefore))
          ) {
            request.filter.endDateLessThanOrEqual = (KalturaUtils.getEndDateValue(item.scheduledBefore));
          }
        }

        break;
      default:
        break
    }
  });
});
