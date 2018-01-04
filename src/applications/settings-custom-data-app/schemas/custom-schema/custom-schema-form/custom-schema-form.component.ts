import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsMetadataProfile } from '../../schemas-store/settings-metadata-profile.interface';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Component({
  selector: 'kCustomSchemaForm',
  templateUrl: './custom-schema-form.component.html',
  styleUrls: ['./custom-schema-form.component.scss']
})
export class CustomSchemaFormComponent {
  @Input() set schema(value: SettingsMetadataProfile) {
    if (value) {
      this._schema = value;
      this._schemaForm.patchValue({
        name: value.name,
        description: value.description,
        systemName: value.systemName,
        applyTo: value.applyTo
      });
    } else {
      throw Error('schema must be provided');
    }
  }

  @Output() schemaChanges = new EventEmitter<SettingsMetadataProfile>();

  private _schema: SettingsMetadataProfile;

  public _schemaForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _systemNameField: AbstractControl;
  public _applyToField: AbstractControl;
  public _applyToValues = {
    entries: this._appLocalization.get('applications.settings.metadata.applyTo.entries'),
    categories: this._appLocalization.get('applications.settings.metadata.applyTo.categories')
  };

  constructor(private _fb: FormBuilder,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._schemaForm = this._fb.group({
      name: ['', Validators.required],
      description: '',
      systemName: '',
      applyTo: this._appLocalization.get('applications.settings.metadata.applyTo.entries')
    });

    this._nameField = this._schemaForm.controls['name'];
    this._descriptionField = this._schemaForm.controls['description'];
    this._systemNameField = this._schemaForm.controls['systemName'];
    this._applyToField = this._schemaForm.controls['applyTo'];

    this._schemaForm.valueChanges.subscribe((change) => {
      if (this._schema.name !== change.name) {
        this._schema.name = change.name;
      }

      if (this._schema.description !== change.description) {
        this._schema.description = change.description;
      }

      if (this._schema.systemName !== change.systemName) {
        this._schema.systemName = change.systemName;
      }

      if (this._schema.applyTo !== change.applyTo) {
        this._schema.applyTo = change.applyTo;
      }

      this.schemaChanges.emit(this._schema);
    });
  }
}

