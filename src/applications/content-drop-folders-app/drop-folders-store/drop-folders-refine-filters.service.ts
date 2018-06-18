import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DefaultFiltersList } from './default-filters-list';
import { AppLocalization } from '@kaltura-ng/mc-shared';

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
export class DropFoldersRefineFiltersService {
  constructor(private _appLocalization: AppLocalization) {
  }

  public getFilters(): Observable<RefineList[]> {
    return Observable.of(this._buildDefaultFiltersGroup());
  }

  private _buildDefaultFiltersGroup(): RefineList[] {
    return DefaultFiltersList.map((list) => {
      const refineList = new RefineList(
        list.name,
        this._appLocalization.get(`applications.content.dropFolders.dropFolderStatusLabels.${list.label}`)
      );

      refineList.items = list.items.map((item: any) => ({
        value: item.value,
        label: this._appLocalization.get(`applications.content.dropFolders.dropFolderStatusLabels.${item.label}`)
      }));

      return refineList;
    });
  }
}
