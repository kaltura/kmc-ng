import * as R from 'ramda';

import { KalturaMetadataSearchItem } from 'kaltura-typescript-client/types/KalturaMetadataSearchItem';
import { KalturaSearchCondition } from 'kaltura-typescript-client/types/KalturaSearchCondition';
import { KalturaSearchOperatorType } from 'kaltura-typescript-client/types/KalturaSearchOperatorType';

import { ValueFilter } from '../value-filter';
import { EntriesStore } from '../entries-store.service';
import { FilterItem } from '../filter-item';


export class MetadataProfileFilter extends ValueFilter<string> {

    static filterType = "MetadataProfile"; // IMPORTANT: you must have a static filterType property that is used at runtime

    private _metadataProfileId: number;

  public get metadataProfileId(): number {
    return this._metadataProfileId;
  }

  private _fieldPath: string[];

  public get fieldPath(): string[] {
    return this._fieldPath;
  }

  private _name: string;

  public get name(): string {
    return this._name;
  }

  constructor(name: string, value: string, metadataProfileId: number, fieldPath: string[], listName: string) {
    super(value + '', value, { token: 'applications.content.filters.metaData', args: { '0': listName, '1': value } });
    this._name = name;
    this._metadataProfileId = metadataProfileId;
    this._fieldPath = fieldPath;
  }

  public isEqual(otherFilter: FilterItem): boolean {
    return super.isEqual(otherFilter)
      && otherFilter instanceof MetadataProfileFilter
      && this.name === otherFilter.name;
  }
}

EntriesStore.registerFilterType(MetadataProfileFilter, (items, request) => {
  // group all filters by metadata profile id
  R.values(R.groupBy((item: MetadataProfileFilter) => {
    return item.metadataProfileId + '';
  }, items)).forEach((groupItems: MetadataProfileFilter[]) => {
    // create metadata search item for each profile
    const metadataProfileId = groupItems[0].metadataProfileId;
    const metadataItem: KalturaMetadataSearchItem = new KalturaMetadataSearchItem(
      {
        metadataProfileId: metadataProfileId,
        type: KalturaSearchOperatorType.searchAnd,
        items: []
      }
    );
    request.advancedSearch.items.push(metadataItem);

    // group all metadata profile id items by filter field
    R.values(R.groupBy((item: MetadataProfileFilter) => {
      return item.fieldPath.join(',');
    }, groupItems)).forEach((filterItems: MetadataProfileFilter[]) => {
      const innerMetadataItem: KalturaMetadataSearchItem = new KalturaMetadataSearchItem({});
      const filterField = R.reduce((acc: string, value: string) => {
        return `${acc}/*[local-name()='${value}']`;
      }, '', filterItems[0].fieldPath);

      innerMetadataItem.metadataProfileId = metadataProfileId;
      innerMetadataItem.type = KalturaSearchOperatorType.searchOr;
      innerMetadataItem.items = [];
      metadataItem.items.push(innerMetadataItem);

      filterItems.forEach(filterItem => {
        const searchItem = new KalturaSearchCondition({
          field: filterField,
          value: filterItem.value
        });

        innerMetadataItem.items.push(searchItem);
      });
    });
  });
});
