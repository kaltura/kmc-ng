import * as moment from 'moment';

import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';
import { EntriesStore } from '../entries-store.service';
import { FilterItem } from '../filter-item';

export class CreatedAtFilter extends FilterItem {

    static filterType = "CreatedAt"; // IMPORTANT: you must have a static filterType property that is used at runtime


    private _createdBefore: Date;
  private _createdAfter: Date;

  public get createdAfter(): Date {
    return this._createdAfter;
  }

  public get createdBefore(): Date {
    return this._createdBefore;
  }

  constructor(createdAfter?: Date, createdBefore?: Date) {
    let tooltip = '';
    if (createdAfter && createdBefore) {
      tooltip = `${moment(createdAfter).format('LL')} - ${moment(createdBefore).format('LL')}`;
    } else if (createdAfter) {
      tooltip = `From ${moment(createdAfter).format('LL')}`;
    } else if (createdBefore) {
      tooltip = `Until ${moment(createdBefore).format('LL')}`;
    }

    super('Dates', { token: tooltip });
    this._createdAfter = createdAfter;
    this._createdBefore = createdBefore;
  }

  public isEqual(otherFilter: FilterItem): boolean {
    return super.isEqual(otherFilter)
      && otherFilter instanceof CreatedAtFilter
      && this._createdAfter === otherFilter._createdAfter
      && this._createdBefore === otherFilter._createdBefore;
  }
}

EntriesStore.registerFilterType(CreatedAtFilter, (items, request) => {
  const firstItem = items[0];

  if (firstItem.createdBefore) {
    request.filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(firstItem.createdBefore);
  }

  if (firstItem.createdAfter) {
    request.filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(firstItem.createdAfter);
  }
});
