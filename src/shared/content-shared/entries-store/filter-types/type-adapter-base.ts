
export abstract class TypeAdapterBase
{
    abstract copy(value: any): any;
    abstract hasChanged(currentValue: any, previousValue: any): boolean;
}