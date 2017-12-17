import { TypeAdapterBase } from './type-adapter-base';
import { FiltersUtils } from 'app-shared/content-shared/entries-store/filters-utils';

export interface GroupedListItem {
    value: string;
    label: string;
    payload?: { [key: string]: any }
}

export interface GroupedListType
{
    [id: string]: GroupedListItem[]
}

export class GroupedListAdapter extends TypeAdapterBase<GroupedListType> {

    // private _validateType(value: any) {
    //     if (value === null || !(value instanceof Object)) {
    //         throw new Error(`invalid value provided. expected value of type 'Object'`);
    //     } else {
    //         Object.keys(value).forEach(listId => {
    //             const list = value[listId];
    //             const invalidItem = list.find(item => item === null || !(typeof item.value === 'string') || !(typeof item.label === 'string') || item.value.length === 0 || item.label.length === 0);
    //
    //             if (invalidItem) {
    //                 throw new Error(`invalid value provided. each item must have a 'value' and a 'label' properties`);
    //             }
    //         });
    //     }
    // }

    // copy(value: GroupedListType): GroupedListType {
    //     return value ? Object.assign({}, value) : null;
    // }

    // validate(value: GroupedListType): { failed: boolean, failureCode: string } {
    //     try {
    //         this._validateType(value);
    //         return {failed: false, failureCode: null};
    //     } catch (error) {
    //         return {failed: true, failureCode: 'invalid_types'};
    //     }
    // }

    hasChanges(currentValue: GroupedListType, previousValue: GroupedListType): boolean {
        const isCurrentValueNull = currentValue === null || typeof currentValue === 'undefined';
        const isPreviousValueNull = previousValue === null || typeof previousValue === 'undefined';

        if (isCurrentValueNull && isPreviousValueNull) {
            return false;
        } else if (FiltersUtils.hasChanges(currentValue, previousValue)) {
            return true;
        } else {
            Object.keys(currentValue).forEach(listName => {
                const currentValueMap = FiltersUtils.toMap(currentValue[listName], 'value');
                const previousValueMap = FiltersUtils.toMap(previousValue[listName], 'value');
                if (FiltersUtils.hasChanges(currentValueMap, previousValueMap)) {
                    return true;
                }
            })
        }

        return false;
    }
}