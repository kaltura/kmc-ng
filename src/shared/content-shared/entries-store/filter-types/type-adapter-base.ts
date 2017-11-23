
export abstract class TypeAdapterBase<T>
{
    abstract copy(value: T): T;
    abstract hasChanged(currentValue: T, previousValue: T): boolean;
    abstract validate(value: T): { failed: boolean, failureCode: string };
}