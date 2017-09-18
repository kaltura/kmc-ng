import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';

import { DefaultFiltersList } from './default-filters-list';
import { ValueFilter } from 'app-shared/content-shared/entries-store/value-filter';
import { FilterItem } from 'app-shared/content-shared/entries-store/filter-item';

export type BulkUploadFilterResolver = (node: PrimeTreeNode) => ValueFilter<any>;
export type BulkUploadFilterType = { new(...args): FilterItem };
export type IsBulkUploadFilterOfRefineFilter = (filter: FilterItem) => boolean;


export type UpdateStatus = {
  loading: boolean;
  errorMessage: string;
};

export class RefineFilter {
  public items: { id: string, name: string }[] = [];

  constructor(public name: string,
              public label: string,
              public bulkUploadFilterType: BulkUploadFilterType,
              public isBulkUploadOfRefineFilter: IsBulkUploadFilterOfRefineFilter,
              public bulkUploadFilterResolver: BulkUploadFilterResolver) {
  }
}

export interface RefineFilterGroup {
  label: string;
  filters: RefineFilter[];
}

@Injectable()
export class BulkLogRefineFiltersProviderService {
  private _filters = new ReplaySubject<{ groups: RefineFilterGroup[] }>(1);
  private _status: BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({
    loading: false,
    errorMessage: null
  });

  public filters$ = this._filters.asObservable();
  public status$ = this._status.asObservable();


  constructor() {
    this.load();
  }

  public load(): void {
    const defaultFilterGroup = this._buildDefaultFiltersGroup();

    this._filters.next({ groups: [defaultFilterGroup] });
    this._status.next({ loading: false, errorMessage: null });
  }

  private _buildDefaultFiltersGroup(): RefineFilterGroup {
    const result: RefineFilterGroup = { label: '', filters: [] };

    // build constant filters
    DefaultFiltersList.forEach((defaultFilterList) => {
      const newRefineFilter = new RefineFilter(
        defaultFilterList.name,
        defaultFilterList.label,
        defaultFilterList.bulkUploadFilterType,
        defaultFilterList.isBulkUploadOfRefineFilter,
        defaultFilterList.bulkUploadFilterResolver
      );
      result.filters.push(newRefineFilter);
      defaultFilterList.items.forEach((item: any) => {
        newRefineFilter.items.push({ id: item.id, name: item.name });
      });

    });

    return result;
  }
}
