import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { ValueFilter } from 'app-shared/content-shared/entries-store/value-filter';
import { FilterItem } from 'app-shared/content-shared/entries-store/filter-item';
import { UploadedItemFilter } from '../bulk-log-store/filters/uploaded-item-filter';
import { StatusFilter } from '../bulk-log-store/filters/status-filter';

export type EntriesFilterResolver = (node: PrimeTreeNode) => ValueFilter<any>;
export type EntriesFilterType = { new(...args): FilterItem };
export type IsEntryFilterOfRefineFilter = (filter: FilterItem) => boolean;


export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { id: string, name: string }[],
  bulkUploadFilterResolver: EntriesFilterResolver,
  isBulkUploadOfRefineFilter: IsEntryFilterOfRefineFilter,
  bulkUploadFilterType: EntriesFilterType
}[] = [
  {
    name: 'uploadedItem', label: 'Uploaded items',
    bulkUploadFilterResolver: (node: PrimeTreeNode) => {
      return new UploadedItemFilter(<string>node.data, node.label);
    },
    bulkUploadFilterType: UploadedItemFilter,
    isBulkUploadOfRefineFilter: filter => {
      return filter instanceof UploadedItemFilter;
    },
    items: [
      { id: '1', name: 'Entries' },
      { id: '2', name: 'Categories' },
      { id: '3', name: 'End Users' },
      { id: '4', name: 'End-User Entitlements' }

    ]
  },
  {
    name: 'status', label: 'Statuses',
    bulkUploadFilterResolver: (node: PrimeTreeNode) => {
      return new StatusFilter(<string>node.data, node.label);
    },
    bulkUploadFilterType: StatusFilter,
    isBulkUploadOfRefineFilter: filter => {
      return filter instanceof StatusFilter;
    },
    items: [
      { id: '5', name: 'Finished successfully' },
      { id: '12', name: 'Finished with errors' },
      { id: '6,10', name: 'Failed' },
      { id: '0,1,2,3,4,7,8,9,11', name: 'All other statuses' }
    ]
  }
];
