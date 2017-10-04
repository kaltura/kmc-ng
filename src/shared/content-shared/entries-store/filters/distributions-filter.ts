import { KalturaSearchOperator } from 'kaltura-typescript-client/types/KalturaSearchOperator';
import { KalturaContentDistributionSearchItem } from 'kaltura-typescript-client/types/KalturaContentDistributionSearchItem';
import { KalturaSearchOperatorType } from 'kaltura-typescript-client/types/KalturaSearchOperatorType';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

export class DistributionsFilter extends ValueFilter<number> {

    static filterType = "Distributions"; // IMPORTANT: you must have a static filterType property that is used at runtime


    constructor(value: number, label: string) {
    super(label, value, { token: 'applications.content.filters.distribution', args: { '0': label } });
  }
}

EntriesStore.registerFilterType(DistributionsFilter, (items, request) => {
  const distributionItem = new KalturaSearchOperator({
    type: KalturaSearchOperatorType.searchOr
  });

  request.advancedSearch.items.push(distributionItem);

  items.forEach(item => {
    const newItem = new KalturaContentDistributionSearchItem(
      {
        distributionProfileId: item.value,
        hasEntryDistributionValidationErrors: false,
        noDistributionProfiles: false
      }
    );

    distributionItem.items.push(newItem)
  });
});
