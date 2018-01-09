import { EnumTypeAdapter, TypeAdapterBase } from '@kaltura-ng/mc-shared/filters';
import { FiltersUtils } from '@kaltura-ng/mc-shared/filters/filters-utils';

export enum CategoriesModes {
    Self,
    SelfAndChildren
}

export type CategoriesModeType = CategoriesModes;


export class CategoriesModeAdapter extends EnumTypeAdapter<CategoriesModes> {

    hasChanges(currentValue: CategoriesModeType, previousValue: CategoriesModeType): boolean {

        return currentValue !== previousValue;
    }
}
