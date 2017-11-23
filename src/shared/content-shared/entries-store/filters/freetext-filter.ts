
import { FilterAdapter } from './filter-adapter';

export class FreetextFilter implements FilterAdapter {
    private _validateType(value: any) {
        if (value !== null && !(typeof value === 'string')) {
            throw new Error('invalid value type. expected value of type string');
        }
    }

    copy(value: any): any {
        this._validateType(value);
        return value;
    }

    hasChanged(currentValue: any, previousValue: any): boolean {
        this._validateType(previousValue);
        this._validateType(currentValue);

        return previousValue !== currentValue;
    }
}
