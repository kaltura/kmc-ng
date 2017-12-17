
export abstract class TypeAdapterBase<T>
{
    abstract hasChanges(currentValue: T, previousValue: T): boolean;
    validate(value: any): { failed: boolean, failureCode: string } {
        return {failed: false, failureCode: null};
    }

    get isValueImmutable(): boolean
    {
        return false; // danger - don't override unless you are cetrain this  type is immutable
    }
}