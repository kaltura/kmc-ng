

import {FilterItem, FilterRequestContext} from "../filter-item";
export class TimeSchedulingFilter  extends FilterItem{


    private _value : string;
    private _scheduledTo : Date;
    private _scheduledFrom : Date;

    public get value() : string{
        return this._value;
    }

    public get scheduledFrom() : Date{
        return this._scheduledFrom;
    }

    public get scheduledTo() : Date{
        return this._scheduledTo;
    }

    constructor(value : string, label : string, scheduledTo? : Date, scheduledFrom? : Date)
    {
        super(label);
        this._value = value;
        this._scheduledFrom = scheduledFrom;
        this._scheduledTo = scheduledTo;
    }

    private toServerDate(value?: Date): number {
        return value ? value.getTime() / 1000 : null;
    }

    _buildRequest(request : FilterRequestContext) : void {
      switch (this._value)
      {
          case 'past':
              request.filter.endDateLessThanOrEqual = this.toServerDate(new Date());
              break;
          case 'live':
              request.filter.startDateLessThanOrEqualOrNull = this.toServerDate(new Date());
              request.filter.endDateGreaterThanOrEqualOrNull = this.toServerDate(new Date());
              break;
          case 'future':
              request.filter.startDateGreaterThanOrEqual = this.toServerDate(new Date());
              break;
          case 'scheduled':
              request.filter.startDateGreaterThanOrEqual = this.toServerDate(this.scheduledFrom);
              request.filter.endDateLessThanOrEqual = this.toServerDate(this.scheduledTo);
              break;
          default:
              break
      }
    }
}
