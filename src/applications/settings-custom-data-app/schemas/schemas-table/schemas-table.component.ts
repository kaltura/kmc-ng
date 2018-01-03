import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Menu, MenuItem } from 'primeng/primeng';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { SchemasStore, SettingsMetadataProfile } from '../schemas-store/schemas-store.service';

@Component({
  selector: 'kSchemasTable',
  templateUrl: './schemas-table.component.html',
  styleUrls: ['./schemas-table.component.scss']
})
export class SchemasTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() set schemas(data: SettingsMetadataProfile[]) {
    if (!this._deferredLoading) {
      this._schemas = [];
      this._cdRef.detectChanges();
      this._schemas = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredSchemas = data
    }
  }

  @Input() selectedSchemas: SettingsMetadataProfile[] = [];

  @Output() selectedSchemasChange = new EventEmitter<any>();
  @Output() actionSelected = new EventEmitter<any>();

  @ViewChild('actionsmenu') private actionsMenu: Menu;

  private _actionsMenuSchemaId: number;
  private _deferredSchemas: SettingsMetadataProfile[];

  public _deferredLoading = true;
  public _emptyMessage = '';
  public _blockerMessage: AreaBlockerMessage = null;
  public _items: MenuItem[];
  public _schemas: SettingsMetadataProfile[] = [];

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private _appLocalization: AppLocalization,
              public _schemasStore: SchemasStore,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to 'no results' only after search
    this._schemasStore.schemas.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          if (result.errorMessage) {
            this._blockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || 'Error loading schemas',
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._schemasStore.reload();
                }
              }
              ]
            })
          } else {
            this._blockerMessage = null;
            if (result.loading) {
              this._emptyMessage = '';
              loadedOnce = true;
            } else {
              if (loadedOnce) {
                this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
              }
            }
          }
        },
        error => {
          console.warn('[kmcng] -> could not load schemas'); // navigate to error page
          throw error;
        });
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._schemas = this._deferredSchemas;
        this._deferredSchemas = null;
      }, 0);
    }
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }

  private _buildMenu(schema: SettingsMetadataProfile): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.metadata.table.actions.edit'),
        command: () => this._onActionSelected('edit', schema)
      },
      {
        label: this._appLocalization.get('applications.settings.metadata.table.actions.download'),
        command: () => this._onActionSelected('download', schema)
      },
      {
        label: this._appLocalization.get('applications.settings.metadata.table.actions.delete'),
        command: () => this._onActionSelected('delete', schema)
      }
    ];
  }

  public _openActionsMenu(event: any, schema: SettingsMetadataProfile): void {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if (this._actionsMenuSchemaId !== schema.id) {
        this._buildMenu(schema);
        this._actionsMenuSchemaId = schema.id;
        this.actionsMenu.show(event);
      }
    }
  }

  public _onSelectionChange(event): void {
    this.selectedSchemasChange.emit(event);
  }

  public _onActionSelected(action: string, schema: SettingsMetadataProfile): void {
    this.actionSelected.emit({ action, schema });
  }

  public _schemaTableRowStyle(rowData: SettingsMetadataProfile): string {
    return rowData.profileDisabled ? 'kProfileDisabled' : '';
  }
}

