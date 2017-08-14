import { Component, OnInit } from '@angular/core';
import { UploadSettingsHandler } from './upload-settings-handler';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'kKMCUploadSettings',
  templateUrl: './upload-settings.component.html',
  styleUrls: ['./upload-settings.component.scss']
})
export class UploadSettingsComponent implements OnInit {
  public _transcodingProfiles: Array<{ value: number, label: string }>;
  public _profileForm: FormGroup;
  public _transcodingProfileField: AbstractControl;
  public _transcodingProfileError = '';

  constructor(private _handler: UploadSettingsHandler, private _formBuilder: FormBuilder) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._profileForm = this._formBuilder.group({ 'transcodingProfile': '' });
    this._transcodingProfileField = this._profileForm.controls['transcodingProfile'];
    this._transcodingProfileField.disable();
  }

  ngOnInit() {
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
}
