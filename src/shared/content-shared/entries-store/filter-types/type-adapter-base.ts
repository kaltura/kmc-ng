
export abstract class TypeAdapterBase<T>
{
    abstract copy(value: T): T;
    abstract hasChanges(currentValue: T, previousValue: T): boolean;
    abstract validate(value: any): { failed: boolean, failureCode: string };
}