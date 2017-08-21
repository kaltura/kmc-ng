import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UploadSettingsFile, UploadSettingsService } from './upload-settings.service';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BrowserService } from 'app-shared/kmc-shell';
import { KmcUploadAppService } from '../kmc-upload-app.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kKMCUploadSettings',
  templateUrl: './upload-settings.component.html',
  styleUrls: ['./upload-settings.component.scss'],
  providers: [UploadSettingsService]
})
export class UploadSettingsComponent implements OnInit {
  @Output() onFileSelected = new EventEmitter<FileList>();
  @Output() onUploadStarted = new EventEmitter<void>();

  private _tempName: string;

  public _transcodingProfiles: Array<{ value: number, label: string }>;
  public _profileForm: FormGroup;
  public _transcodingProfileField: AbstractControl;
  public _transcodingProfileError: AreaBlockerMessage;
  public _transcodingProfileLoading = false;
  public _files: Array<UploadSettingsFile> = [];
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
    return this._uploadService.allowedExtensions;
  }

  constructor(private _uploadSettingsService: UploadSettingsService,
              private _uploadService: KmcUploadAppService,
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
    // this._handler.resetFiles();
    this._uploadSettingsService.selectedFiles$.subscribe(items => {
      this._files = items;
    });

    this._transcodingProfileLoading = true;
    this._uploadService.getTranscodingProfiles()
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
          this._transcodingProfileError = new AreaBlockerMessage({ message: error.message, buttons: [] });
          this._uploadService.resetTranscodingProfiles();
        });
  }

  public _removeFile(file: UploadSettingsFile): void {
    this._uploadSettingsService.removeFile(file);
  }

  public _upload(files: Array<UploadSettingsFile>): void {
    const errorMessage = this._uploadSettingsService.upload(files, this._transcodingProfileField.value);

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

  public _editName(file: UploadSettingsFile): void {
    this._tempName = file.name;
    file.isEditing = true;
  }

  public _updateName(name: string = ''): void {
    this._tempName = name.trim() || '';
  }

  public _cancelEdit(file: UploadSettingsFile): void {
    const name = this._tempName;

    if (file.name === name) {
      file.isEditing = false;
      return;
    }

    if (name && file.name !== name) {
      file.isEditing = file.hasError = false;
      file.name = name;
      this._tempName = '';
    } else {
      file.hasError = true;
    }
  }
}
