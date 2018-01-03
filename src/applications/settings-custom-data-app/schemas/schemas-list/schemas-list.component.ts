import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { SchemasFilters, SchemasStore, SettingsMetadataProfile } from '../schemas-store/schemas-store.service';

@Component({
  selector: 'kSchemasList',
  templateUrl: './schemas-list.component.html',
  styleUrls: ['./schemas-list.component.scss']
})
export class SchemasListComponent implements OnInit, OnDestroy {
  public _blockerMessage: AreaBlockerMessage = null;

  public _selectedSchemas: SettingsMetadataProfile[] = [];

  public _query = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(public _schemasStore: SchemasStore,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._schemasStore.cloneFilters(
      [
        'pageSize',
        'pageIndex'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<SchemasFilters>): void {
    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._schemasStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._clearSelection();
        this._browserService.scrollToTop();
      });
  }

  public _clearSelection(): void {
    this._selectedSchemas = [];
  }

  public _deleteSchemas(schemas: SettingsMetadataProfile[]): void {

  }

  public _addSchema(): void {

  }

  public _onActionSelected({ action, schema }: { action: string, schema: SettingsMetadataProfile }): void {
    switch (action) {
      case 'edit':
        // TBD
        break;
      case 'download':
        if (schema.downloadUrl) {
          this._browserService.download(schema.downloadUrl, `${schema.name}.xml`, 'text/xml');
        }
        break;
      case 'delete':
        // TBD
        break;
      default:
        break;
    }
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._schemasStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }
}
