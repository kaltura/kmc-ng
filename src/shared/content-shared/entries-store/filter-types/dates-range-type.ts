import { TypeAdapterBase } from './type-adapter-base';

export interface DatesRangeType {
    fromDate: Date | null,
    toDate: Date | null
}

export class DatesRangeAdapter extends TypeAdapterBase<DatesRangeType> {
    private _validateType(value: DatesRangeType) {
        if (value && value.fromDate && !(value.fromDate instanceof Date)) {
            throw new Error(`invalid value. expected 'fromDate' to be of type 'Date'`);
        } else if (value && value.toDate && !(value.toDate instanceof Date)) {
            throw new Error(`invalid value. expected 'toDate' to be of type 'Date'`);
        }
    }

    copy(value: DatesRangeType): DatesRangeType {
        this._validateType(value);

        const {fromDate, toDate} = value || {
            fromDate: null,
            toDate: null
        };

        return {
            fromDate: fromDate ? new Date(fromDate.getTime()) : null,
            toDate: toDate ? new Date(toDate.getTime()) : null
        };
    }

    hasChanged(currentValue: DatesRangeType, previousValue: DatesRangeType): boolean {
        const previousFromDate = previousValue && previousValue.fromDate ? previousValue.fromDate.getTime() : null;
        const previousToDate = previousValue && previousValue.toDate ? previousValue.toDate.getTime() : null;
        const currentFromDate = currentValue && currentValue.fromDate ? currentValue.fromDate.getTime() : null;
        const currentToDate = currentValue && currentValue.toDate ? currentValue.toDate.getTime() : null;

        return previousFromDate !== currentFromDate || previousToDate !== currentToDate;
    }
}