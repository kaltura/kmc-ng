
export abstract class TypeAdapterBase<T>
{
    //abstract copy(value: T): T;
    abstract hasChanges(currentValue: T, previousValue: T): boolean;
    validate(value: any): { failed: boolean, failureCode: string } {
        return {failed: false, failureCode: null};
    }
}