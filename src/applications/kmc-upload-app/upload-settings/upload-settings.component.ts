import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IUploadSettingsFile, UploadSettingsHandler } from './upload-settings-handler';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';

@Component({
  selector: 'kKMCUploadSettings',
  templateUrl: './upload-settings.component.html',
  styleUrls: ['./upload-settings.component.scss']
})
export class UploadSettingsComponent implements OnInit {
  @Output() onFileSelected = new EventEmitter<FileList>();
  public _transcodingProfiles: Array<{ value: number, label: string }>;
  public _profileForm: FormGroup;
  public _transcodingProfileField: AbstractControl;
  public _transcodingProfileError = '';
  private _files: Array<IUploadSettingsFile> = [];
  public _fileTypes: Array<SelectItem> = [
    {
      'label': this._appLocalization.get('app.upload.uploadSettings.mediaTypes.video'),
      'value': KalturaMediaType.video
    },
    {
      'label': this._appLocalization.get('app.upload.uploadSettings.mediaTypes.audio'),
      'value': KalturaMediaType.audio
    },
    {
      'label': this._appLocalization.get('app.upload.uploadSettings.mediaTypes.image'),
      'value': KalturaMediaType.image
    },
  ];

  public get _allowedExtensions() {
    return this._handler.allowedExtensions;
  }

  constructor(private _handler: UploadSettingsHandler,
              private _formBuilder: FormBuilder,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._profileForm = this._formBuilder.group({ 'transcodingProfile': '' });
    this._transcodingProfileField = this._profileForm.controls['transcodingProfile'];
    this._transcodingProfileField.disable();
  }

  ngOnInit() {
    this._handler.selectedFiles$.subscribe(({ items }) => {
      this._files = items;
    });

    this._handler.getTranscodingProfiles()
      .subscribe(
        profiles => {
          this._transcodingProfileField.enable();
          this._transcodingProfiles = profiles.map(({ name: label, id: value }) => ({ label, value }));

          const defaultValue = profiles.find(({ isDefault }) => !!isDefault);
          if (defaultValue) {
            this._transcodingProfileField.setValue({ label: defaultValue.name, value: defaultValue.id })
          }
        },
        (error) => {
          this._transcodingProfileError = error.message;
        });
  }

  public _removeFile(file: IUploadSettingsFile) {
    this._handler.removeFile(file);
  }
}
