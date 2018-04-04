import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';
import { KalturaMetadataProfile } from 'kaltura-ngx-client/api/types/KalturaMetadataProfile';
import { BrowserService } from 'app-shared/kmc-shell';
import { MetadataItem } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';
import { KalturaAPIException, KalturaTypesFactory } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaMetadataObjectType } from 'kaltura-ngx-client/api/types/KalturaMetadataObjectType';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kCustomSchema',
  templateUrl: './custom-schema.component.html',
  styleUrls: ['./custom-schema.component.scss'],
  providers: [KalturaLogger.createLogger('CustomSchemaComponent')]
})
export class CustomSchemaComponent implements OnInit {
  @Input() schema: SettingsMetadataProfile;
  @Input() serverValidationError: KalturaAPIException = null;

  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<SettingsMetadataProfile>();

  @ViewChild('customSchemaField') _customSchemaFieldPopup: PopupWidgetComponent;

  private _isFieldsOrderChanged = false;

  public _title;
  public _schema: SettingsMetadataProfile;
  public _selectedFields: MetadataItem[] = [];
  public _selectedField: MetadataItem;
  public _isDirty = false;
  public _profileFields: MetadataItem[];

  constructor(private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
    if (this.schema) {
      this._logger.info(`enter edit schema mode for existing schema`, { id: this.schema.id, name: this.schema.name });
      this._schema = <SettingsMetadataProfile>Object.assign(KalturaTypesFactory.createObject(this.schema), this.schema);
      this._profileFields = (this._schema.parsedProfile && Array.isArray(this._schema.parsedProfile.items))
        ? [...this._schema.parsedProfile.items] : [];
      this._title = this._appLocalization.get('applications.settings.metadata.editCustomSchema');
    } else {
      this._logger.info(`enter add schema mode`);
      this._title = this._appLocalization.get('applications.settings.metadata.addCustomSchema');
      const schema = <SettingsMetadataProfile>(new KalturaMetadataProfile({
        name: '',
        description: '',
        systemName: ''
      }));
      schema.isNew = true;
      schema.profileDisabled = false;
      schema.applyTo = KalturaMetadataObjectType.entry;
      (<any>schema).parsedProfile = { items: [] };

      this._schema = schema;
      this._profileFields = [];
    }
  }

  private _fieldsOrderChanged(): void {
    this._logger.debug(`fields order was changed by the user`);
    this._isFieldsOrderChanged = true;
  }

  private _validateSchema(): boolean {
    this._logger.info(`validate schema`);
    const schemaName = this._schema.name.trim();
    let error = '';

    if (!schemaName) {
      error = this._appLocalization.get('applications.settings.metadata.requiredSchemaName');
    } else if (schemaName.length > 31) {
      error = this._appLocalization.get('applications.settings.metadata.schemaNameLength');
    } else if (!this._profileFields.length) {
      error = this._appLocalization.get('applications.settings.metadata.fieldsRequired');
    }

    if (error) {
      this._browserService.alert({
        header: this._appLocalization.get('applications.settings.metadata.invalidInput'),
        message: error
      });

      this._logger.info(`schema is not valid, stop saving`, { errorMessage: error });

      return false;
    }

    this._logger.info(`schema is valid, proceed saving`);
    return true;
  }

  private _removeField(field: MetadataItem): void {
    this._browserService.confirm({
      header: this._appLocalization.get('applications.settings.metadata.table.deleteCustomDataField'),
      message: this._appLocalization.get('applications.settings.metadata.table.fieldRemoveConfirmation', [field.name]),
      accept: () => {
        this._logger.info(`handle accept 'remove' field by the user`, { field: { id: field.id, name: field.name } });
        const relevantFieldIndex = this._profileFields.findIndex(item => item.id === field.id);
        if (relevantFieldIndex !== -1) {
          this._profileFields.splice(relevantFieldIndex, 1);
          this._setDirty();
        }
        this._clearSelection();
      },
      reject: () => {
        this._logger.info(`handle reject 'remove' field by the user`, { field: { id: field.id, name: field.name } });
      }
    });
  }

  private _moveField(field: MetadataItem, direction: 'up' | 'down'): void {
    const action = direction === 'down'
      ? () => KalturaUtils.moveDownItems(this._profileFields, [field])
      : () => KalturaUtils.moveUpItems(this._profileFields, [field]);
    if (action()) {
      this._setDirty();
      this._fieldsOrderChanged();
    }
  }

  public _saveSchema(): void {
    this._logger.info(`handle 'save' updated schema by the user`);
    if (this._validateSchema()) {
      this._schema.parsedProfile.items = this._profileFields;

      if (this._isFieldsOrderChanged) {
        this._browserService.confirm({
          header: this._appLocalization.get('applications.settings.metadata.fieldsOrderChangedTitle'),
          message: this._appLocalization.get('applications.settings.metadata.fieldsOrderChangedWaring'),
          accept: () => {
            this.onSave.emit(this._schema);
          }
        });
      } else {
        this.onSave.emit(this._schema);
      }
    }
  }

  public _clearSelection(): void {
    this._logger.info(`handle 'clear selection' action`);
    this._selectedFields = [];
  }

  public _downloadSchema(): void {
    this._logger.info(`handle 'downloadSchema' action by the user`);
    if (this._schema && this._schema.downloadUrl) {
      this._browserService.download(this._schema.downloadUrl, `${this._schema.name}.xml`, 'text/xml');
    }
  }

  public _actionSelected(event: { action: string, payload: { field: MetadataItem, direction?: 'up' | 'down' } }): void {
    const { action, payload } = event;
    switch (action) {
      case 'edit':
        this._logger.info(`handle 'edit field' action by the user`, { field: { id: payload.field.id, name: payload.field.name } });
        this._editField(payload.field);
        break;

      case 'move':
        const { field, direction } = payload;
        this._logger.info(`handle 'move field' action by the user`, { field: { id: field.id, name: field.name, direction } });
        this._moveField(field, direction);
        break;

      case 'remove':
        this._logger.info(`handle 'remove field' action by the user`, { field: { id: payload.field.id, name: payload.field.name } });
        this._removeField(payload.field);
        break;

      default:
        break;
    }
  }

  public _bulkMove(direction: 'up' | 'down'): void {
    this._logger.info(`handle 'bulk move fields' action by the user`, { direction });
    const action = direction === 'down'
      ? () => KalturaUtils.moveDownItems(this._profileFields, this._selectedFields)
      : () => KalturaUtils.moveUpItems(this._profileFields, this._selectedFields);
    if (action()) {
      this._setDirty();
      this._fieldsOrderChanged();
    }
  }

  public _bulkRemove(): void {
    this._logger.info(`handle 'bulk remove fields' action by the user`);
    this._browserService.confirm({
      header: this._appLocalization.get('applications.settings.metadata.table.bulkDeleteCustomDataField'),
      message: this._appLocalization.get('applications.settings.metadata.table.fieldBulkRemoveConfirmation'),
      accept: () => {
        this._logger.info(`handle accept 'bulk remove fields' action by the user`);
        this._selectedFields.forEach(field => {
          const relevantFieldIndex = this._profileFields.findIndex(item => item.id === field.id);
          if (relevantFieldIndex !== -1) {
            this._profileFields.splice(relevantFieldIndex, 1);
            this._setDirty();
          }
        });
        this._clearSelection();
      },
      reject: () => {
        this._logger.info(`handle reject 'bulk remove fields' action by the user`);
      }
    });
  }

  public _setDirty(): void {
    this._logger.debug(`change component state to dirty`);
    this._isDirty = true;
  }

  public _cancel(): void {
    this._logger.info(`handle cancel editing by the user`);
    if (this._isDirty) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.settings.metadata.discardChanges'),
        message: this._appLocalization.get('applications.settings.metadata.discardWarning'),
        accept: () => {
          this._logger.info(`accept discarding changes by the user`);
          this.onClosePopupWidget.emit();
        },
        reject: () => {
          this._logger.info(`reject discarding changes by the user, staying in the popup`);
        }
      });
    } else {
      this.onClosePopupWidget.emit();
    }
  }

  public _editField(field: MetadataItem): void {
    this._selectedField = field;
    this._customSchemaFieldPopup.open();
  }

  public _saveField(field: MetadataItem): void {
    this._logger.info(`handle 'save' updated field by the user`, { field: { id: field.id, name: field.name } });
    const relevantFieldIndex = this._profileFields.findIndex(({ id }) => id === field.id);
    const isNew = relevantFieldIndex === -1;
    if (isNew) {
      this._profileFields.push(field);
    } else {
      this._profileFields = [
        ...this._profileFields.slice(0, relevantFieldIndex),
        field,
        ...this._profileFields.slice(relevantFieldIndex + 1)
      ];
    }

    this._selectedField = null;
    this._setDirty();
  }
}

