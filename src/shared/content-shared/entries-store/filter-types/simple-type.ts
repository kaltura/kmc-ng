import { TypeAdapterBase } from './type-adapter-base';

export type SimpleTypes = string | number | boolean;

export abstract class SimpleTypeAdapterBase<T extends SimpleTypes> extends TypeAdapterBase<T> {
    protected abstract _validateType(value: any);

    copy(value: T): T {
        this._validateType(value);
        return value;
    }

    validate(value: T): { failed: boolean, failureCode: string } {
        return {failed: false, failureCode: null};
    }

    hasChanged(currentValue: T, previousValue: T): boolean {
        this._validateType(previousValue);
        this._validateType(currentValue);

        return previousValue !== currentValue;
    }
}