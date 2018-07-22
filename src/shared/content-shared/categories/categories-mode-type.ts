import { EnumTypeAdapter, TypeAdapterBase } from '@kaltura-ng/mc-shared';
import { FiltersUtils } from '@kaltura-ng/mc-shared';

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
