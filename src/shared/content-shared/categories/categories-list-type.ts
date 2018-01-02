import { TypeAdapterBase } from '@kaltura-ng/mc-shared/filters';
import { FiltersUtils } from '@kaltura-ng/mc-shared/filters/filters-utils';

export interface CategoriesListItem {
    value: string;
    label: string;
    fullIdPath: string[];
    tooltip: string;
}

export type CategoriesListType = CategoriesListItem[];


export class CategoriesListAdapter extends TypeAdapterBase<CategoriesListType> {

    hasChanges(currentValue: CategoriesListType, previousValue: CategoriesListType): boolean {

        const currentValueMap = FiltersUtils.toMap(currentValue, 'value');
        const previousValueMap = FiltersUtils.toMap(previousValue, 'value');
        return FiltersUtils.hasChanges(currentValueMap, previousValueMap);
    }
}
