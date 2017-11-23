import { TypeAdapterBase } from './type-adapter-base';

export interface ValuesListItem {
    value: string;
    label: string;
}

export type ValuesListType = ValuesListItem[];

function mapFromArray(array, prop) {
    const map = {};
    for (let i=0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}

function getDelta<T>(source : T[], compareTo : T[], keyPropertyName: string): { added : T[], deleted : T[], } {
    const delta :  {
        added: T[],
        deleted: T[]
    } = {
        added: [],
        deleted: []
    };

    const mapSource = mapFromArray(source, keyPropertyName);
    const mapCompareTo = mapFromArray(compareTo, keyPropertyName);
    for (const id in mapSource) {
        if (!mapCompareTo.hasOwnProperty(id)) {
            delta.deleted.push(mapSource[id]);
        }
    }

    for (const id in mapCompareTo) {
        if (!mapSource.hasOwnProperty(id)) {
            delta.added.push( mapCompareTo[id] )
        }
    }
    return delta;
}

export class ValuesListAdapter extends TypeAdapterBase<ValuesListType> {

    private _validateType(items: ValuesListType) {
        if (items !== null && !(items instanceof Array)) {
            throw new Error(`invalid value provided. expected value of type 'Array'`);
        } else {
            const invalidItem = items.find(item => item === null || !(typeof item.value === 'string') || typeof item.label === 'undefined');

            if (invalidItem) {
                throw new Error(`invalid value provided. each item must have a 'value' and a 'label' properties`);
            }
        }
    }

    copy(value: ValuesListType): ValuesListType {
        return value ? [...value] : null;
    }

    validate(value: ValuesListType): { failed: boolean, failureCode: string } {
        return {failed: false, failureCode: null};
    }

    hasChanged(currentValue: ValuesListType, previousValue: ValuesListType): boolean {
        this._validateType(previousValue);
        this._validateType(currentValue);

        const hasChangesByArray = (currentValue === null && previousValue !== null)
            || (currentValue !== null && previousValue === null);

        if (!hasChangesByArray && currentValue !== null && previousValue !== null) {
            const diff = getDelta<any>(previousValue, currentValue, 'value');

            return diff.deleted.length > 0 || diff.added.length > 0;
        }

        return false;
    }
}