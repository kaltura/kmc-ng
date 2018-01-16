import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';
import { KalturaMetadataProfile } from 'kaltura-ngx-client/api/types/KalturaMetadataProfile';
import { BrowserService } from 'app-shared/kmc-shell';
import { MetadataItem } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';
import { KalturaTypesFactory } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kCustomSchema',
  templateUrl: './custom-schema.component.html',
  styleUrls: ['./custom-schema.component.scss']
})
export class CustomSchemaComponent {
  @Input() set schema(value: SettingsMetadataProfile) {
    if (value) {
      this._schema = <SettingsMetadataProfile>Object.assign(KalturaTypesFactory.createObject(value), value);
      this._profileFields = (this._schema.parsedProfile && this._schema.parsedProfile.items && this._schema.parsedProfile.items.length)
        ? this._schema.parsedProfile.items : [];
      this._title = this._appLocalization.get('applications.settings.metadata.editCustomSchema');
    } else {
      this._title = this._appLocalization.get('applications.settings.metadata.addCustomSchema');
      const schema = <SettingsMetadataProfile>(new KalturaMetadataProfile({
        name: '',
        description: '',
        systemName: ''
      }));
      schema.isNew = true;
      schema.profileDisabled = false;
      schema.applyTo = this._appLocalization.get('applications.settings.metadata.applyTo.entries');
      (<any>schema).parsedProfile = { items: [] };

      this._schema = schema;
      this._profileFields = [];
    }
  }

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
              private _browserService: BrowserService) {
  }

  private _fieldsOrderChanged(): void {
    this._isFieldsOrderChanged = true;
  }

  private _validateSchema(): boolean {
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

      return false;
    }

    return true;
  }

  private _removeField(field: MetadataItem): void {
    this._browserService.confirm({
      header: this._appLocalization.get('applications.settings.metadata.table.deleteCustomDataField'),
      message: this._appLocalization.get('applications.settings.metadata.table.fieldRemoveConfirmation', [field.name]),
      accept: () => {
        const relevantFieldIndex = this._profileFields.findIndex(item => item.id === field.id);
        if (relevantFieldIndex !== -1) {
          this._profileFields.splice(relevantFieldIndex, 1);
          this._setDirty();
        }
        this._clearSelection();
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
    if (this._validateSchema()) {
      this._schema.parsedProfile.items = this._profileFields;

      if (this._isFieldsOrderChanged) {
        this._browserService.confirm({
          header: this._appLocalization.get('applications.settings.metadata.fieldsOrderChangedTitle'),
          message: this._appLocalization.get('applications.settings.metadata.fieldsOrderChangedWaring'),
          accept: () => {
            this.onSave.emit(this._schema);
            this.onClosePopupWidget.emit();
          }
        });
      } else {
        this.onSave.emit(this._schema);
        this.onClosePopupWidget.emit();
      }
    }
  }

  public _clearSelection(): void {
    this._selectedFields = [];
  }

  public _downloadSchema(): void {
    if (this._schema && this._schema.downloadUrl) {
      this._browserService.download(this._schema.downloadUrl, `${this._schema.name}.xml`, 'text/xml');
    }
  }

  public _actionSelected(event: { action: string, payload: { field: MetadataItem, direction?: 'up' | 'down' } }): void {
    const { action, payload } = event;
    switch (action) {
      case 'edit':
        this._editField(payload.field);
        break;

      case 'move':
        const { field, direction } = payload;
        this._moveField(field, direction);
        break;

      case 'remove':
        this._removeField(payload.field);
        break;

      default:
        break;
    }
  }

  public _bulkMove(direction: 'up' | 'down'): void {
    const action = direction === 'down'
      ? () => KalturaUtils.moveDownItems(this._profileFields, this._selectedFields)
      : () => KalturaUtils.moveUpItems(this._profileFields, this._selectedFields);
    if (action()) {
      this._setDirty();
      this._fieldsOrderChanged();
    }
  }

  public _bulkRemove(): void {
    this._browserService.confirm({
      header: this._appLocalization.get('applications.settings.metadata.table.bulkDeleteCustomDataField'),
      message: this._appLocalization.get('applications.settings.metadata.table.fieldBulkRemoveConfirmation'),
      accept: () => {
        this._selectedFields.forEach(field => {
          const relevantFieldIndex = this._profileFields.findIndex(item => item.id === field.id);
          if (relevantFieldIndex !== -1) {
            this._profileFields.splice(relevantFieldIndex, 1);
            this._setDirty();
          }
        });
        this._clearSelection();
      }
    });
  }

  public _setDirty(): void {
    this._isDirty = true;
  }

  public _cancel(): void {
    if (this._isDirty) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.settings.metadata.discardChanges'),
        message: this._appLocalization.get('applications.settings.metadata.discardWarning'),
        accept: () => {
          this.onClosePopupWidget.emit();
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

