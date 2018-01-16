import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { MetadataItem, MetadataItemTypes } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';
import { BrowserService } from 'app-shared/kmc-shell';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kCustomSchemaFieldForm',
  templateUrl: './custom-schema-field-form.component.html',
  styleUrls: ['./custom-schema-field-form.component.scss']
})
export class CustomSchemaFieldFormComponent implements OnDestroy, AfterViewInit {
  @Input() set field(value: MetadataItem | null) {
    if (value) {
      this._isNew = false;
      this._field = <MetadataItem>Object.assign({}, value);
      this._title = this._appLocalization.get('applications.settings.metadata.editCustomField');
      this._saveBtnLabel = this._appLocalization.get('applications.settings.metadata.save');
      this._setInitialValue(this._field);
    } else {
      this._title = this._appLocalization.get('applications.settings.metadata.addCustomField');
      this._saveBtnLabel = this._appLocalization.get('applications.settings.metadata.add');
    }
  }

  @Input() set fields(value: MetadataItem[] | null) {
    if (value && value.length) {
      this._systemNames = value.map(({ name }) => name);
      this._fieldsIds = value.map(({ id }) => id);
    }
  }

  @Input() parentPopupWidget: PopupWidgetComponent;

  @Output() onSave = new EventEmitter<MetadataItem>();

  private _field: MetadataItem;
  private _isNew = true;
  private _systemNames: string[] = [];
  private _fieldsIds: string[] = [];
  private _fieldIdGenerator = new FriendlyHashId();

  public _title: string;
  public _saveBtnLabel: string;
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
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
    this._buildForm();
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
        .cancelOnDestroy(this)
        .filter(event => event.state === PopupWidgetStates.BeforeClose)
        .subscribe(event => {
          const canPreventClose = event.context && event.context.allowClose;

          if (canPreventClose && this._fieldForm.dirty) {
            event.context.allowClose = false;
            this._cancel();
          }
        });
    }
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

    this._setPristine();
  }

  private _setPristine(): void {
    this._fieldForm.markAsPristine();
    this._fieldForm.updateValueAndValidity();
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

  private _update(): MetadataItem {
    const formValue = this._fieldForm.getRawValue();
    const { label, shortDescription, description, searchable, includeTime, listValues } = formValue;

    if (this._field.label !== label) {
      this._field.label = label;
    }

    if (this._field.description !== shortDescription) {
      this._field.description = shortDescription;
    }

    if (this._field.documentations !== description) {
      this._field.documentations = description;
    }

    if (this._field.isSearchable !== searchable) {
      this._field.isSearchable = searchable;
    }

    if (this._field.isTimeControl !== includeTime) {
      this._field.isTimeControl = includeTime;
    }

    if (formValue.type === MetadataItemTypes.List) {
      const currentValue = this._field.optionalValues.map(({ value }) => value).join('\n');
      const newValue = listValues.trim();
      if (currentValue !== newValue) {
        this._field.optionalValues = newValue.split('\n').map(value => ({ value, text: value }));
      }
    }

    return this._field;
  }

  private _create(): MetadataItem {
    const formValue = this._fieldForm.value;
    const { label, type, allowMultiple, shortDescription, description, searchable, includeTime, listValues } = formValue;
    const systemName = label
      .replace(/[~`:;,!@#$%\^*()\-+.={}|?\\\/\[\]]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.substr(1, word.length))
      .join('');

    const systemNameUnique = this._systemNames.indexOf(systemName) === -1;
    if (!systemNameUnique) {
      this._browserService.alert({
        header: this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.invalidInput'),
        message: this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.invalidSystemName'),
      });
      return null;
    }

    const newField = {
      allowMultiple,
      type,
      name: systemName,
      label: label.trim(),
      isSearchable: searchable,
      isTimeControl: includeTime,
      description: shortDescription,
      documentations: description,
      optionalValues: [],
      isRequired: false,
      children: [],
      id: this._fieldIdGenerator.generateUnique(this._fieldsIds)
    };

    if (type === MetadataItemTypes.List) {
      newField.optionalValues = listValues.split('\n').map(value => ({ value, text: value }));
    }

    return newField;
  }

  private _validateForm(): boolean {
    const invalidLabelPrefix = /^[0-9`~:;!@#$%\^&*()\-_+=|',.?\/\\{}<>"\[\]]/;
    const invalidChars = /[<>'"&]/;
    const invalidListValuesOptions = /[`;!#*\+,?\\{}<>"\[\]]/;
    const invalidListValuesOptionsPrefix = /^-/;

    const label = this._labelField.value.trim();
    const shortDescription = this._shortDescriptionField.value;
    const description = this._descriptionField.value;
    const fieldType = this._typeField.value;
    const listValues = this._listValuesFiled.value.trim();
    let error = '';

    if (!label) {
      error = this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.emptyLabel');

    } else if (invalidLabelPrefix.test(label)) {
      error = this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.invalidLabelPrefix');

    } else if (invalidChars.test(label) || invalidChars.test(shortDescription) || invalidChars.test(description)) {
      error = this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.invalidChars');

    } else if (fieldType === MetadataItemTypes.List) {
      if (!listValues) {
        error = this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.emptyListValues');

      } else if (invalidListValuesOptions.test(listValues)) {
        error = this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.invalidListOptions');

      } else if (invalidListValuesOptionsPrefix.test(listValues)) {
        error = this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.invalidListOptionsPrefix');
      }
    }

    if (error) {
      this._browserService.alert({
        header: this._appLocalization.get('applications.settings.metadata.fieldForm.validationErrors.invalidInput'),
        message: error
      });
    }

    return !error;
  }

  public _cancel(): void {
    if (this._fieldForm.dirty) {
      this._browserService.confirm({
        message: this._appLocalization.get('applications.settings.metadata.fieldForm.saveChanges'),
        accept: () => {
          this._save();
        },
        reject: () => {
          this._setPristine();
          this.parentPopupWidget.close();
        }
      });
    } else {
      this.parentPopupWidget.close();
    }
  }

  public _save(): void {
    const formValid = this._validateForm();

    if (formValid) {
      const updatedField = this._field ? this._update() : this._create();

      if (updatedField) {
        this.onSave.emit(updatedField);

        this._setPristine();
        this.parentPopupWidget.close();
      }
    }
  }
}

