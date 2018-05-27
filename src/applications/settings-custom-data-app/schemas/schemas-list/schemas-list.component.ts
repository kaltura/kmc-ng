import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { SchemasFilters, SchemasStore } from '../schemas-store/schemas-store.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';
import { AppEventsService } from 'app-shared/kmc-shared';
import { MetadataProfileUpdatedEvent } from 'app-shared/kmc-shared/events/metadata-profile-updated.event';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kSchemasList',
  templateUrl: './schemas-list.component.html',
  styleUrls: ['./schemas-list.component.scss'],
  providers: [KalturaLogger.createLogger('SchemasListComponent')]
})
export class SchemasListComponent implements OnInit, OnDestroy {
  @ViewChild('customSchema') _customSchemaPopup: PopupWidgetComponent;

  public _selectedSchemas: SettingsMetadataProfile[] = [];
  public _selectedSchema: SettingsMetadataProfile = null;
  public _tableIsBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _serverValidationError = null;
  public _kmcPermissions = KMCPermissions;

  public _query = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(public _schemasStore: SchemasStore,
              private _appEvents: AppEventsService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._logger.info(`init custom data list view`);
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
            this._blockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || this._appLocalization.get('applications.settings.metadata.errorLoading'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this._schemasStore.reload();
                }
              }
              ]
            });
          } else {
            this._blockerMessage = null;
          }
        });
  }

  private _updateMetadataProfiles(): void {
    this._logger.info(`publish app event 'MetadataProfileUpdatedEvent'`);
    this._appEvents.publish(new MetadataProfileUpdatedEvent());
  }

  private _proceedDeleteSchemas(schemas: SettingsMetadataProfile[]): void {
    this._logger.info(`send delete schema request to the server`);
    this._blockerMessage = null;
    this._schemasStore.deleteProfiles(schemas)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._logger.info(`handle success delete by the server`);
          this._schemasStore.reload();
          this._clearSelection();
          this._updateMetadataProfiles();
        },
        error => {
          const msg: string = error.message ? error.message : this._appLocalization.get('app.common.connectionError');
          this._logger.info(`handle failing delete by the server`, { errorMessage: msg });
          this._blockerMessage = new AreaBlockerMessage({
            message: msg,
            buttons: [
              {
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this._logger.info(`handle dismiss request by the user`);
                  this._blockerMessage = null;
                  this._schemasStore.reload();
                }
              }
            ]
          });
        }
      );
  }

  public _clearSelection(): void {
    this._logger.info(`handle clear selection by the user`);
    this._selectedSchemas = [];
  }

  public _onActionSelected({ action, schema }: { action: string, schema: SettingsMetadataProfile }): void {
    switch (action) {
      case 'edit':
        this._logger.info(`handle 'edit' action by the user`);
        if (!schema.profileDisabled) {
          this._clearSelection();
          this._selectedSchema = schema;
          this._customSchemaPopup.open();
        } else {
          this._logger.info(`the profile is disabled, do not proceed editing`, { schema: { id: schema.id, name: schema.name } });
        }
        break;
      case 'download':
        this._logger.info(`handle 'download' action by the user`);
        if (schema.downloadUrl) {
          this._browserService.download(schema.downloadUrl, `${schema.name}.xml`, 'text/xml');
        } else {
          this._logger.info(
            `the profile doesn't have 'downloadUrl', do not proceed downloading`,
            { schema: { id: schema.id, name: schema.name } }
          );
        }
        break;
      case 'delete':
        this._logger.info(`handle 'delete' action by the user`);
        this._deleteSchemas([schema]);
        break;
      default:
        break;
    }
  }

  public _deleteSchemas(selectedSchemas: SettingsMetadataProfile[]): void {
    const schemasToDelete = selectedSchemas.map((schema, index) => {
      return selectedSchemas.length > 1 ? `${index + 1}: ${schema.name}` : schema.name;
    });
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
        },
        reject: () => {
          this._logger.info(`handle discard 'delete' action by the user`);
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
    this._logger.info(`send updated schema to the server`);
    this._schemasStore.saveSchema(schema)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._logger.info(`handle success update by the server`);
          this._serverValidationError = null;
          this._customSchemaPopup.close();
          this._schemasStore.reload();
          this._updateMetadataProfiles();
        },
        (error) => {
          this._logger.info(`handle failing delete by the server`, { errorMessage: error.message });
          this._serverValidationError = error;
          this._browserService.alert({
              header: this._appLocalization.get('app.common.attention'),
            message: error.message,
            accept: () => {
              this._logger.info(`handle dismiss request by the user`);
              this._schemasStore.reload();
            }
          });
        }
      );
  }

  public _addNewSchema(): void {
    this._logger.info(`handle 'add schema' action by the user`);
    this._selectedSchema = null;
    this._customSchemaPopup.open();
  }
}
