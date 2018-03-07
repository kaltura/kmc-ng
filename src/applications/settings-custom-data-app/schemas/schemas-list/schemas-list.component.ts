import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { SchemasFilters, SchemasStore } from '../schemas-store/schemas-store.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';
import { AppEventsService } from 'app-shared/kmc-shared';
import { MetadataProfileUpdatedEvent } from 'app-shared/kmc-shared/events/metadata-profile-updated.event';

@Component({
  selector: 'kSchemasList',
  templateUrl: './schemas-list.component.html',
  styleUrls: ['./schemas-list.component.scss']
})
export class SchemasListComponent implements OnInit, OnDestroy {
  @ViewChild('customSchema') _customSchemaPopup: PopupWidgetComponent;

  public _selectedSchemas: SettingsMetadataProfile[] = [];
  public _selectedSchema: SettingsMetadataProfile = null;
  public _tableIsBusy = false;
  public _tableBlockerMessage: AreaBlockerMessage = null;
  public _serverValidationError = null;

  public _query = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(public _schemasStore: SchemasStore,
              private _appEvents: AppEventsService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
    this._registerToDataChanges();
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

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
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

  private _registerToDataChanges(): void {
    this._schemasStore.schemas.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {

          this._tableIsBusy = result.loading;

          if (result.errorMessage) {
            this._tableBlockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || this._appLocalization.get('applications.settings.metadata.errorLoading'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._tableBlockerMessage = null;
                  this._schemasStore.reload();
                }
              }
              ]
            })
          } else {
            this._tableBlockerMessage = null;
          }
        },
        error => {
          console.warn('[kmcng] -> could not load schemas'); // navigate to error page
          throw error;
        });
  }

  private _updateMetadataProfiles(): void {
    this._appEvents.publish(new MetadataProfileUpdatedEvent());
  }

  private _proceedDeleteSchemas(schemas: SettingsMetadataProfile[]): void {
    this._schemasStore.deleteProfiles(schemas)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._schemasStore.reload();
          this._clearSelection();
          this._updateMetadataProfiles();
        },
        error => {
          this._browserService.alert({
            message: error.message || this._appLocalization.get('applications.settings.metadata.updateError'),
            accept: () => {
              this._clearSelection();
              this._schemasStore.reload();
            }
          });
        }
      );
  }

  public _clearSelection(): void {
    this._selectedSchemas = [];
  }

  public _onActionSelected({ action, schema }: { action: string, schema: SettingsMetadataProfile }): void {
    switch (action) {
      case 'edit':
        if (!schema.profileDisabled) {
          this._clearSelection();
          this._selectedSchema = schema;
          this._customSchemaPopup.open();
        }
        break;
      case 'download':
        if (schema.downloadUrl) {
          this._browserService.download(schema.downloadUrl, `${schema.name}.xml`, 'text/xml');
        }
        break;
      case 'delete':
        this._deleteSchemas([schema]);
        break;
      default:
        break;
    }
  }

  public _deleteSchemas(selectedSchemas: SettingsMetadataProfile[]): void {
    const schemasToDelete = selectedSchemas.map((playlist, index) => `${index + 1}: ${playlist.name}`);
    const schemas = selectedSchemas.length <= 5 ? schemasToDelete.join(',').replace(/,/gi, '\n') : '';
    let message = '';
    if (selectedSchemas.length > 5) {
      message = this._appLocalization.get('applications.settings.metadata.confirmDeleteMultiple');
    } else if (selectedSchemas.length === 1) {
      message = this._appLocalization.get('applications.settings.metadata.confirmDeleteSingle', { 0: schemas });
    } else {
      message = this._appLocalization.get('applications.settings.metadata.confirmDeleteMultipleNames', { 0: schemas });
    }
    const header = selectedSchemas.length > 1 ?
      this._appLocalization.get('applications.settings.metadata.deleteSchemas') :
      this._appLocalization.get('applications.settings.metadata.deleteSchema');
    this._browserService.confirm(
      {
        header,
        message,
        accept: () => {
          this._proceedDeleteSchemas(selectedSchemas);
        }
      }
    );
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._schemasStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _onClosePopup(): void {
    this._customSchemaPopup.close();
    this._selectedSchema = null;
  }

  public _saveSchema(schema: SettingsMetadataProfile): void {
    this._schemasStore.saveSchema(schema)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._serverValidationError = null;
          this._customSchemaPopup.close();
          this._schemasStore.reload();
          this._updateMetadataProfiles();
        },
        (error) => {
          this._serverValidationError = error;
          this._browserService.alert({
            message: error.message,
            accept: () => {
              this._schemasStore.reload();
            }
          });
        }
      );
  }

  public _addNewSchema(): void {
    this._selectedSchema = null;
    this._customSchemaPopup.open();
  }
}
