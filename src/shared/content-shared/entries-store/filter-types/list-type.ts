import { TypeAdapterBase } from './type-adapter-base';
import { FiltersUtils } from 'app-shared/content-shared/entries-store/filters-utils';

export interface ListItem {
    value: string;
    label: string;
}

export type ListType = ListItem[];


export class ListAdapter extends TypeAdapterBase<ListType> {

    // private _validateType(value: ListType) {
    //     if (value === null || !(value instanceof Array)) {
    //         throw new Error(`invalid value provided. expected value of type 'Array'`);
    //     } else {
    //         const invalidItem = value.find(item => item === null || !(typeof item.value === 'string') || !(typeof item.label === 'string') || item.value.length === 0 || item.label.length === 0);
    //
    //         if (invalidItem) {
    //             throw new Error(`invalid value provided. each item must have a 'value' and a 'label' properties`);
    //         }
    //     }
    // }

    // copy(value: ListType): ListType {
    //     return value ? [...value] : null;
    // }
    //
    // validate(value: any): { failed: boolean, failureCode: string } {
    //     return {failed: false, failureCode: null};
    // }

    hasChanges(currentValue: ListType, previousValue: ListType): boolean {

        return FiltersUtils.hasChanges(currentValue, previousValue);
    }
}