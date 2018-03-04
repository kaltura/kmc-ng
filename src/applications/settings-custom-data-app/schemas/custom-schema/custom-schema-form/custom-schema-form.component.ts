import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsMetadataProfile } from '../../schemas-store/settings-metadata-profile.interface';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KalturaMetadataObjectType } from 'kaltura-ngx-client/api/types/KalturaMetadataObjectType';
import { KalturaAPIException } from 'kaltura-ngx-client';

@Component({
  selector: 'kCustomSchemaForm',
  templateUrl: './custom-schema-form.component.html',
  styleUrls: ['./custom-schema-form.component.scss']
})
export class CustomSchemaFormComponent {
  @Input() set serverValidationError(value: KalturaAPIException) {
    if (value) {
      if (value.code === 'SYSTEM_NAME_ALREADY_EXISTS') {
        this._systemNameField.setErrors({ 'incorrect': true });
      }
    }
  }

  @Input() set schema(value: SettingsMetadataProfile) {
    if (value) {
      this._schema = value;
      this._schemaForm.patchValue(
        {
          name: value.name,
          description: value.description,
          systemName: value.systemName,
          applyTo: value.applyTo
        },
        { emitEvent: false }
      );

      if (!this._schema.isNew) {
        this._applyToField.disable({ onlySelf: true });
      }
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
    entry: KalturaMetadataObjectType.entry,
    category: KalturaMetadataObjectType.category
  };

  constructor(private _fb: FormBuilder) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._schemaForm = this._fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(31)])],
      description: '',
      systemName: '',
      applyTo: KalturaMetadataObjectType.entry
    });

    this._nameField = this._schemaForm.controls['name'];
    this._descriptionField = this._schemaForm.controls['description'];
    this._systemNameField = this._schemaForm.controls['systemName'];
    this._applyToField = this._schemaForm.controls['applyTo'];

    this._schemaForm.valueChanges.subscribe((change) => {
      let sendUpdate = false;
      if (this._schema.name !== change.name) {
        this._schema.name = change.name;
        sendUpdate = true;
      }

      if (this._schema.description !== change.description) {
        this._schema.description = change.description;
        sendUpdate = true;
      }

      if (this._schema.systemName !== change.systemName) {
        this._schema.systemName = change.systemName;
        sendUpdate = true;
      }

      if (change.applyTo) {
        if (!this._schema.applyTo === change.applyTo) {
          this._schema.applyTo = change.applyTo;
          sendUpdate = true;
        }
      }

      if (sendUpdate) {
        this.schemaChanges.emit(this._schema);
      }
    });
  }
}

