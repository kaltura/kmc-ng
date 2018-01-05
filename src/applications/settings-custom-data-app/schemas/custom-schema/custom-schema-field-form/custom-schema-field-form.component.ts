import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { MetadataItem, MetadataItemTypes } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';

@Component({
  selector: 'kCustomSchemaFieldForm',
  templateUrl: './custom-schema-field-form.component.html',
  styleUrls: ['./custom-schema-field-form.component.scss']
})
export class CustomSchemaFieldFormComponent {
  @Input() set field(value: MetadataItem | null) {
    if (value) {
      this._field = value;
      this._title = this._appLocalization.get('applications.settings.metadata.editCustomField');

    } else {
      this._title = this._appLocalization.get('applications.settings.metadata.addCustomField');
    }
  }

  private _field: MetadataItem;

  public _title;
  public _fieldForm: FormGroup;
  public _typeField: AbstractControl;
  public _labelField: AbstractControl;
  public _allowMultipleField: AbstractControl;
  public _shortDescriptionField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _searchableField: AbstractControl;
  // optional fields
  public _includeTimeField: AbstractControl;
  public _listValuesFiled: AbstractControl;

  public _metadataItemTypes = MetadataItemTypes;
  public _fieldTypes = [
    {
      label: this._appLocalization.get('applications.settings.metadata.type.text'),
      value: MetadataItemTypes.Text
    },
    {
      label: this._appLocalization.get('applications.settings.metadata.type.date'),
      value: MetadataItemTypes.Date
    },
    {
      label: this._appLocalization.get('applications.settings.metadata.type.object'),
      value: MetadataItemTypes.Object
    },
    {
      label: this._appLocalization.get('applications.settings.metadata.type.list'),
      value: MetadataItemTypes.List
    }
  ];

  constructor(private _fb: FormBuilder,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._fieldForm = this._fb.group({
      type: MetadataItemTypes.Text,
      allowMultiple: false,
      label: ['', Validators.required],
      shortDescription: '',
      description: '',
      searchable: true,

      // optional fields
      includeTime: false,
      listValues: '',
    });

    this._typeField = this._fieldForm.controls['type'];
    this._allowMultipleField = this._fieldForm.controls['allowMultiple'];
    this._labelField = this._fieldForm.controls['label'];
    this._shortDescriptionField = this._fieldForm.controls['shortDescription'];
    this._descriptionField = this._fieldForm.controls['description'];
    this._searchableField = this._fieldForm.controls['searchable'];

    // optional fields
    this._includeTimeField = this._fieldForm.controls['includeTime'];
    this._listValuesFiled = this._fieldForm.controls['listValues'];

    this._typeField.valueChanges.subscribe(change => {
      this._fieldForm.patchValue({ searchable: change !== MetadataItemTypes.Date });
    });
  }
}

