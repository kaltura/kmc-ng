import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';

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
    }
  }
  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  public _title;
  public _schema: SettingsMetadataProfile;

  constructor(private _appLocalization: AppLocalization) {
  }

  public _saveSchema(): void {
    this.onSave.emit();
    this.onClosePopupWidget.emit();
  }
}

