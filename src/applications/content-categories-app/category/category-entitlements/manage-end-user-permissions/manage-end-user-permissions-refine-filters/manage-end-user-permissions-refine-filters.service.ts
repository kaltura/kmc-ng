import {Injectable} from '@angular/core';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/forkJoin';

import {DefaultFiltersList} from './default-filters-list';

export interface RefineGroupListItem {
  value: string,
  label: string
}

export class RefineGroupList {
  public items: RefineGroupListItem[] = [];

  constructor(public name: string,
              public label: string,
              public group?: string) {
  }
}

export interface RefineGroup {
  label: string;
  lists: RefineGroupList[];
}

@Injectable()
export class ManageEndUserPermissionsRefineFiltersService {

  constructor() {
  }

  public getFilters(): RefineGroup {
    const result: RefineGroup = {label: '', lists: []};

    // build constant filters
    DefaultFiltersList.forEach((defaultFilterList) => {
      const newRefineFilter = new RefineGroupList(
        defaultFilterList.name,
        defaultFilterList.label
      );
      result.lists.push(newRefineFilter);
      defaultFilterList.items.forEach((item: any) => {
        newRefineFilter.items.push({value: item.value, label: item.label});
      });

    });

    return result;
  }
}
