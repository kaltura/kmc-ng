import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { MetadataItem, MetadataItemTypes } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';

@Component({
  selector: 'kCustomSchemaFieldForm',
  templateUrl: './custom-schema-field-form.component.html',
  styleUrls: ['./custom-schema-field-form.component.scss']
})
export class CustomSchemaFieldFormComponent implements OnDestroy {
  @Input() set field(value: MetadataItem | null) {
    if (value) {
      this._isNew = false;
      this._field = <MetadataItem>Object.assign({}, value);
      this._title = this._appLocalization.get('applications.settings.metadata.editCustomField');
      this._setInitialValue(this._field);
    } else {
      this._title = this._appLocalization.get('applications.settings.metadata.addCustomField');
    }
  }

  @Output() onClose = new EventEmitter<void>();

  private _field: MetadataItem;
  private _isNew = true;

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

  ngOnDestroy() {

  }

  private _setInitialValue(field: MetadataItem): void {
    this._fieldForm.setValue({
      type: field.type,
      allowMultiple: field.allowMultiple,
      label: field.label,
      shortDescription: field.description,
      description: field.documentations,
      searchable: !!field.isSearchable,

      includeTime: !!field.isTimeControl,
      listValues: (field.optionalValues && field.optionalValues.length)
        ? field.optionalValues.map(({ value }) => value).join('\n')
        : ''
    });

    this._typeField.disable();
    this._allowMultipleField.disable();
  }

  private _buildForm(): void {
    this._fieldForm = this._fb.group({
      type: MetadataItemTypes.Text,
      allowMultiple: false,
      label: '',
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

    this._typeField.valueChanges
      .cancelOnDestroy(this)
      .filter(() => this._isNew)
      .subscribe(change => {
        this._fieldForm.patchValue({ searchable: change !== MetadataItemTypes.Date });
      });
  }

  private _update(): void {

  }

  private _create(): void {

  }

  public _cancel(): void {
    this.onClose.emit();
  }

  public _save(): void {

  }
}

