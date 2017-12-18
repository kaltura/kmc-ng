import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DefaultFiltersList } from './default-filters-list';

export interface RefineGroupListItem {
  value: string,
  label: string
}

export class RefineGroupList {
  public items: RefineGroupListItem[] = [];

  constructor(public name: string, public label: string) {
  }
}

export interface RefineGroup {
  label: string;
  lists: RefineGroupList[];
}

@Injectable()
export class BulkLogRefineFiltersProviderService {
  public getFilters(): Observable<RefineGroup[]> {
    return Observable.of([this._buildDefaultFiltersGroup()]);
  }

  private _buildDefaultFiltersGroup(): RefineGroup {
    const result: RefineGroup = { label: '', lists: [] };

    // build constant filters
    DefaultFiltersList.forEach((defaultFilterList) => {
      const newRefineFilter = new RefineGroupList(
        defaultFilterList.name,
        defaultFilterList.label
      );
      result.lists.push(newRefineFilter);
      defaultFilterList.items.forEach((item: any) => {
        newRefineFilter.items.push({ value: item.value, label: item.label });
      });

    });

    return result;
  }
}
