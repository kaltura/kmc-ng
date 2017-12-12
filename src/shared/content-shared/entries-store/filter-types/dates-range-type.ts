import { TypeAdapterBase } from './type-adapter-base';

export interface DatesRangeType {
    fromDate: Date | null,
    toDate: Date | null
}

export class DatesRangeAdapter extends TypeAdapterBase<DatesRangeType> {
    private _validateType(value: DatesRangeType, throwOnError: boolean = true) : boolean {
        let error: string = null;
        if (value && value.fromDate && !(value.fromDate instanceof Date)) {
            error = `invalid value. expected 'fromDate' to be of type 'Date'`;
        } else if (value && value.toDate && !(value.toDate instanceof Date)) {
            error = `invalid value. expected 'toDate' to be of type 'Date'`;
        }

        if (error) {
            if (throwOnError) {
                throw new Error(`invalid value. expected 'fromDate' to be of type 'Date'`);
            } else {
                return false;
            }
        }

        return true;
    }

    validate(value: any): { failed: boolean, failureCode: string } {
        if (!this._validateType(value, false)) {
            return {failed: true, failureCode: 'invalid_types'};
        } else if (value.fromDate && value.toDate) {
            const isValid = value.fromDate <= value.toDate;

            if (!isValid) {
                return {failed: true, failureCode: 'invalid_range'};
            }
        }

        return {failed: false, failureCode: null};
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

    hasChanges(currentValue: DatesRangeType, previousValue: DatesRangeType): boolean {
        const previousFromDate = previousValue && previousValue.fromDate ? previousValue.fromDate.getTime() : null;
        const previousToDate = previousValue && previousValue.toDate ? previousValue.toDate.getTime() : null;
        const currentFromDate = currentValue && currentValue.fromDate ? currentValue.fromDate.getTime() : null;
        const currentToDate = currentValue && currentValue.toDate ? currentValue.toDate.getTime() : null;

        return previousFromDate !== currentFromDate || previousToDate !== currentToDate;
    }
}