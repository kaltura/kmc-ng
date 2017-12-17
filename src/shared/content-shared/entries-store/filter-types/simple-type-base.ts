import { TypeAdapterBase } from './type-adapter-base';

export type SimpleTypes = string | number | boolean;

export abstract class SimpleTypeAdapterBase<T extends SimpleTypes> extends TypeAdapterBase<T> {

    hasChanges(currentValue: T, previousValue: T): boolean {
        return previousValue !== currentValue;
    }

    get isValueImmutable(): boolean
    {
        return true;
    }
}