import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DefaultFiltersList } from './default-filters-list';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { DropFoldersStoreService } from './drop-folders-store.service';
import { RefineGroup, RefineGroupList } from 'app-shared/content-shared/entries/entries-store/entries-refine-filters.service';
import { catchError, map, publishReplay, refCount } from 'rxjs/operators';

export interface RefineListItem {
    value: string;
    label: string;
}

export class RefineList {
    public items: RefineListItem[] = [];

    constructor(public name: string, public label: string) {
    }
}

@Injectable()
export class DropFoldersRefineFiltersService {
    private _getRefineFilters$: Observable<RefineGroup[]>;

    constructor(private _appLocalization: AppLocalization,
                private _dropFoldersStore: DropFoldersStoreService) {
    }

    public getFilters(): Observable<RefineGroup[]> {
        if (!this._getRefineFilters$) {
            this._getRefineFilters$ = this._dropFoldersStore.loadDropFoldersList(false)
                .pipe(
                    map(({ dropFoldersList }) => {
                        const result = [this._buildDefaultFiltersGroup()];

                        if (dropFoldersList.length) {
                            const group = new RefineGroupList(
                                'dropFolders',
                                this._appLocalization.get(`applications.content.dropFolders.filters.dropFolders`),
                                'dropFoldersNames');
                            group.items = dropFoldersList.map(({ id, name }) => ({ value: String(id), label: name }));
                            result.push({ label: '', lists: [group] });
                        }

                        return result;
                    }),
                    catchError(error => {
                        this._getRefineFilters$ = null;
                        throw error;
                    }),
                    publishReplay(1),
                    refCount(),
                );
        }

        return this._getRefineFilters$;
    }

    private _buildDefaultFiltersGroup(): RefineGroup {
        return {
            label: '',
            lists: DefaultFiltersList.map((list) => {
                const refineList = new RefineList(
                    list.name,
                    this._appLocalization.get(`applications.content.dropFolders.dropFolderStatusLabels.${list.label}`)
                );

                refineList.items = list.items.map((item: any) => ({
                    value: item.value,
                    label: this._appLocalization.get(`applications.content.dropFolders.dropFolderStatusLabels.${item.label}`)
                }));

                return refineList;
            })
        };
    }
}
