import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';
import { KalturaMetadataProfile } from 'kaltura-ngx-client/api/types/KalturaMetadataProfile';
import { BrowserService } from 'app-shared/kmc-shell';
import { MetadataItem } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';

@Component({
  selector: 'kCustomSchema',
  templateUrl: './custom-schema.component.html',
  styleUrls: ['./custom-schema.component.scss']
})
export class CustomSchemaComponent {
  @Input() set schema(value: SettingsMetadataProfile) {
    if (value) {
      this._schema = value;
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

      this._schema = schema;
    }
  }

  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<SettingsMetadataProfile>();

  public _title;
  public _schema: SettingsMetadataProfile;
  public _selectedFields: any[] = [];

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  private _removeField(field: MetadataItem): void {
    this._browserService.confirm({
      header: this._appLocalization.get('applications.settings.metadata.table.deleteCustomDataField'),
      message: this._appLocalization.get('applications.settings.metadata.table.fieldRemoveConfirmation', [field.name]),
      accept: () => {
        const relevantFieldIndex = this._schema.parsedProfile.items.findIndex(item => item.id === field.id);
        if (relevantFieldIndex !== -1) {
          this._schema.parsedProfile.items.splice(relevantFieldIndex, 1);
        }
      }
    });
  }

  public _saveSchema(): void {
    console.warn(this._schema);
    this.onSave.emit(this._schema);
    this.onClosePopupWidget.emit();
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
    switch (event.action) {
      case 'edit':
        // TBD
        break;

      case 'move':
        // TBD
        break;

      case 'remove':
        this._removeField(event.payload.field);
        break;

      default:
        break;
    }
  }
}

