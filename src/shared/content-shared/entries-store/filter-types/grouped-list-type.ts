import { TypeAdapterBase } from './type-adapter-base';

export interface GroupedListItem {
    value: string;
    label: string;
}

export type GroupedListType = { [id: string] : GroupedListItem[] };

function mapFromArray(array, prop) {
    const map = {};
    for (let i=0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}

function areMapsDifferent(source: {[key: string]: any}, compareTo: {[key: string]: any}, deepCompareLevel: number): boolean {
    // its' content is different
    for (const id in source) {
        if (!compareTo.hasOwnProperty(id)) {
            // source has property that not exists in compare to
            return true;
        } else {
            if (deepCompareLevel > 0) {
                const sourcePropertyMap = mapFromArray(source, 'value');
                const compareToPropertyMap = mapFromArray(compareTo, 'value');

                return areMapsDifferent(sourcePropertyMap, compareToPropertyMap, deepCompareLevel - 1);
            } else if (source[id] !== compareTo[id]) {
                return true;
            }
        }
    }

    for (const id in compareTo) {
        if (!source.hasOwnProperty(id)) {
            // compare to  has property that not exists in source
            return true;
        }
    }

    return false;
}

export class GroupedListAdapter extends TypeAdapterBase<GroupedListType> {

    private _validateType(value: any) {
        if (value === null || !(value instanceof Object)) {
            throw new Error(`invalid value provided. expected value of type 'Object'`);
        } else {
            Object.keys(value).forEach(listId => {
                const list = value[listId];
                const invalidItem = list.find(item => item === null || !(typeof item.value === 'string') || !(typeof item.label === 'string') || item.value.length === 0 || item.label.length === 0);

                if (invalidItem) {
                    throw new Error(`invalid value provided. each item must have a 'value' and a 'label' properties`);
                }
            });
        }
    }

    copy(value: GroupedListType): GroupedListType {
        return value ? Object.assign({}, value) : null;
    }

    validate(value: GroupedListType): { failed: boolean, failureCode: string } {
        try {
            this._validateType(value);
            return {failed: false, failureCode: null};
        } catch (error) {
            return {failed: true, failureCode: 'invalid_types'};
        }
    }

    hasChanges(currentValue: GroupedListType, previousValue: GroupedListType): boolean {
        const hasChangesByReference = (currentValue === null && previousValue !== null)
            || (currentValue !== null && previousValue === null);

        if (hasChangesByReference) {
            // is different by reference
            return true;
        } else if (currentValue !== null && previousValue !== null) {
            return areMapsDifferent(currentValue, previousValue, 1);
        } else {
            return false;
        }
    }
}