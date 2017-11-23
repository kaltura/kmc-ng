
import { FilterAdapter } from './filter-adapter';

export class CreatedAtFilter implements FilterAdapter {
    private _validateType(value: any) {
        if (value && value.createdAfter && !(value.createdAfter instanceof Date)) {
            throw new Error(`invalid value. expected 'createdAfter' to be of type 'Date'`);
        } else if (value && value.createdBefore && !(value.createdBefore instanceof Date)) {
            throw new Error(`invalid value. expected 'createdBefore' to be of type 'Date'`);
        }
    }

    copy(value: any): any {
        this._validateType(value);

        const {createdAfter, createdBefore} = value || {
            createdAfter: null,
            createdBefore: null
        };

        return {
            createdAfter : new Date(createdAfter.getTime()),
            createdBefore : new Date(createdBefore.getTime())
        };
    }

    hasChanged(currentValue: any, previousValue: any): boolean {
        const previousCreatedBefore = currentValue && currentValue.createdBefore ? currentValue.createdBefore.getTime() : null;
        const previousCreatedAfter = currentValue && currentValue.createdAfter ? currentValue.createdAfter.getTime() : null;
        const currentCreatedBefore = currentValue && currentValue.createdBefore ? currentValue.createdBefore.getTime() : null;
        const currentCreatedAfter = currentValue && currentValue.createdAfter ? currentValue.createdAfter.getTime() : null;

        return previousCreatedBefore !== currentCreatedBefore || previousCreatedAfter !== currentCreatedAfter;
    }
}
