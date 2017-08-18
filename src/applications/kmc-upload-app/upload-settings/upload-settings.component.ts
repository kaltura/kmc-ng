import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IUploadSettingsFile, UploadSettingsHandler } from './upload-settings-handler';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kKMCUploadSettings',
  templateUrl: './upload-settings.component.html',
  styleUrls: ['./upload-settings.component.scss']
})
export class UploadSettingsComponent implements OnInit {
  @Output() onFileSelected = new EventEmitter<FileList>();
  @Output() onUploadStarted = new EventEmitter<void>();

  private _tempName: string;

  public _transcodingProfiles: Array<{ value: number, label: string }>;
  public _profileForm: FormGroup;
  public _transcodingProfileField: AbstractControl;
  public _transcodingProfileError = '';
  public _transcodingProfileLoading = false;
  public _files: Array<IUploadSettingsFile> = [];
  public _fileTypes: Array<SelectItem> = [
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.video'),
      'value': KalturaMediaType.video
    },
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.audio'),
      'value': KalturaMediaType.audio
    },
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.image'),
      'value': KalturaMediaType.image
    },
  ];

  public get _allowedExtensions(): string {
    return this._handler.allowedExtensions;
  }

  constructor(private _handler: UploadSettingsHandler,
              private _formBuilder: FormBuilder,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._profileForm = this._formBuilder.group({ 'transcodingProfile': '' });
    this._transcodingProfileField = this._profileForm.controls['transcodingProfile'];
    this._transcodingProfileField.disable();
  }

  ngOnInit() {
    this._handler.resetFiles();
    this._handler.selectedFiles$.subscribe(items => {
      this._files = items;
    });

    this._transcodingProfileLoading = true;
    this._handler.getTranscodingProfiles()
      .subscribe(
        profiles => {
          this._transcodingProfileField.enable();
          this._transcodingProfileLoading = false;
          this._transcodingProfiles = profiles.map(({ name: label, id: value }) => ({ label, value }));

          const defaultValue = profiles.find(({ isDefault }) => !!isDefault);
          if (defaultValue) {
            this._transcodingProfileField.setValue(defaultValue.id);
          }
        },
        (error) => {
          this._transcodingProfileError = error.message;
        });
  }

  public _removeFile(file: IUploadSettingsFile): void {
    this._handler.removeFile(file);
  }

  public _upload(files: Array<IUploadSettingsFile>): void {
    const errorMessage = this._handler.upload(files, this._transcodingProfileField.value);

    if (errorMessage) {
      return this._browserService.alert({
        header: this._appLocalization.get('applications.upload.validation.error'),
        message: this._appLocalization.get(errorMessage)
      });
    }

    this.onUploadStarted.emit();
  }

  public _relatedTableRowStyle(rowData): string {
    return rowData.hasError ? 'has-error' : '';
  }

  public _updateName(name: string = ''): void {
    this._tempName = name.trim() || '';
  }

  public _cancelEdit(file: IUploadSettingsFile): void {
    const name = this._tempName;

    if (file.name === name) {
      file.isEditing = false;
      return;
    }

    if (name && file.name !== name) {
      file.isEditing = file.hasError = false;
      this._handler.updateFile(file, Object.assign({}, file, { name }));
      this._tempName = '';
    } else {
      file.hasError = true;
    }
  }
}
