import { TypeAdapterBase } from './type-adapter-base';

export interface DatesRangeType {
    fromDate: Date | null,
    toDate: Date | null
}

export class DatesRangeAdapter extends TypeAdapterBase<DatesRangeType> {

    validate(value: any): { failed: boolean, failureCode: string } {
        // if (!this._validateType(value, false)) {
        //     return {failed: true, failureCode: 'invalid_types'};
        // } else
        if (value.fromDate && value.toDate) {
            const isValid = value.fromDate <= value.toDate;

            if (!isValid) {
                return {failed: true, failureCode: 'invalid_range'};
            }
        }

        return {failed: false, failureCode: null};
    }

    hasChanges(currentValue: DatesRangeType, previousValue: DatesRangeType): boolean {
        const previousFromDate = previousValue && previousValue.fromDate ? previousValue.fromDate.getTime() : null;
        const previousToDate = previousValue && previousValue.toDate ? previousValue.toDate.getTime() : null;
        const currentFromDate = currentValue && currentValue.fromDate ? currentValue.fromDate.getTime() : null;
        const currentToDate = currentValue && currentValue.toDate ? currentValue.toDate.getTime() : null;

        return previousFromDate !== currentFromDate || previousToDate !== currentToDate;
    }
}