import { TypeAdapterBase } from './type-adapter-base';

export type SimpleTypes = SimpleTypeString;

export type SimpleTypeString = string;


export class SimpleTypeAdapter<T extends SimpleTypes> extends TypeAdapterBase {
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