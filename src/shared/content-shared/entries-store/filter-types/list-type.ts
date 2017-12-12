import { TypeAdapterBase } from './type-adapter-base';

export interface ListItem {
    value: string;
    label: string;
}

export type ListType = ListItem[];

function mapFromArray(array, prop) {
    const map = {};
    for (let i=0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}

function areMapsDifferent(source: {[key: string]: any}, compareTo: {[key: string]: any}): boolean {
    // its' content is different
    for (const id in source) {
        if (!compareTo.hasOwnProperty(id)) {
            // source has property that not exists in compare to
            return true;
        } else if (source[id] !== compareTo[id]) {
            return true;
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

export class ListAdapter extends TypeAdapterBase<ListType> {

    private _validateType(value: ListType) {
        if (value === null || !(value instanceof Array)) {
            throw new Error(`invalid value provided. expected value of type 'Array'`);
        } else {
            const invalidItem = value.find(item => item === null || !(typeof item.value === 'string') || !(typeof item.label === 'string') || item.value.length === 0 || item.label.length === 0);

            if (invalidItem) {
                throw new Error(`invalid value provided. each item must have a 'value' and a 'label' properties`);
            }
        }
    }

    copy(value: ListType): ListType {
        return value ? [...value] : null;
    }

    validate(value: any): { failed: boolean, failureCode: string } {
        return {failed: false, failureCode: null};
    }

    hasChanges(currentValue: ListType, previousValue: ListType): boolean {

        const hasChangesByReference = (currentValue === null && previousValue !== null)
            || (currentValue !== null && previousValue === null);

        if (hasChangesByReference) {
            // is different by reference
            return true;
        } else if (currentValue !== null && previousValue !== null) {
            const mapOfCurrent = mapFromArray(currentValue, 'value');
            const mapOfPrevious = mapFromArray(previousValue, 'value');
            return areMapsDifferent(mapOfCurrent, mapOfPrevious);
        } else {
            return false;
        }
    }
}