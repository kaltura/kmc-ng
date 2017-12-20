import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DefaultFiltersList } from './default-filters-list';

export interface RefineListItem {
  value: string,
  label: string
}

export class RefineList {
  public items: RefineListItem[] = [];

  constructor(public name: string, public label: string) {
  }
}

@Injectable()
export class DropFoldersRefineFiltersProviderService {
    public getFilters(): Observable<RefineList[]> {
        return Observable.of(this._buildDefaultFiltersGroup());
    }

    private _buildDefaultFiltersGroup(): RefineList[] {
        return DefaultFiltersList.map((list) => {
            const refineList = new RefineList(
                list.name,
                list.label
            );

            refineList.items = list.items.map((item: any) => (
                {value: item.value, label: item.label}
            ));

            return refineList;
        });
    }
}
