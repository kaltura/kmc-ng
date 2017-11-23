
import { FilterAdapter } from './filter-adapter';

function mapFromArray(array, prop) {
    const map = {};
    for (let i=0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}

// TODO sakal use utils instead
function getDelta<T>(source : T[], compareTo : T[], keyPropertyName : string): { added : T[], deleted : T[], } {
    const delta = {
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

export class MediaTypesFilter implements FilterAdapter {
    copy(value: any): any {
        // TODO sakal consider hash maps
        return value ? [...value] : null;
    }

    private _validateType(value: any) {
        if (value !== null && !(value instanceof Array)) {
            throw new Error(`invalid value provided. expected value of type 'Array'`);
        }else if ((<Array<any>>value).some(item => typeof item['value'] === 'undefined' || item['value'] === null)) {
            throw new Error(`invalid value provided. each item must have a 'value' property`);
        }

    }

    hasChanged(currentValue: any, previousValue: any): boolean {
        this._validateType(previousValue);
        this._validateType(currentValue);

        const hasChangesByArray = (currentValue === null && previousValue !== null)
                || (currentValue !== null && previousValue === null);

        if (!hasChangesByArray && currentValue !== null && previousValue !== null)
        {
            const diff = getDelta<any>(previousValue, currentValue,'value');

            return diff.deleted.length > 0 || diff.added.length > 0;
        }

        return false;
    }
}
