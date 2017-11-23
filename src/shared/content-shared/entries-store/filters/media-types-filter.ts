
import { FilterAdapter } from './filter-adapter';

export class MediaTypesFilter implements FilterAdapter {
    private _validateType(value: any) {

        if (value !== null && !(value instanceof Array)) {
            throw new Error(`invalid value type. expected value of type 'Array'`);
        }
    }

    copy(value: any): any {
        return value ? [...value] : null;
    }

    hasChanged(currentValue: any, previousValue: any): boolean {
        this._validateType(previousValue);
        this._validateType(currentValue);

        return previousValue !== currentValue;
    }
}
