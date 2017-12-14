import { TypeAdapterBase } from './type-adapter-base';

export type SimpleTypes = string | number | boolean;

export abstract class SimpleTypeAdapterBase<T extends SimpleTypes> extends TypeAdapterBase<T> {
    //protected abstract _validateType(value: any);

    // copy(value: T): T {
    //     this._validateType(value);
    //     return value;
    // }

    // validate(value: any): { failed: boolean, failureCode: string } {
    //     try {
    //         this._validateType(value);
    //         return {failed: false, failureCode: null};
    //     } catch (error) {
    //         return {failed: true, failureCode: 'invalid_types'};
    //     }
    // }

    hasChanges(currentValue: T, previousValue: T): boolean {
        return previousValue !== currentValue;
    }

    get isValueImmutable(): boolean
    {
        return true;
    }
}