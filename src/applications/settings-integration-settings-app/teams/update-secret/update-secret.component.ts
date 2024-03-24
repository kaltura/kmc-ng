import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { tag } from '@kaltura-ng/kaltura-common';
import {TeamsIntegration, TeamsService} from '../teams.service';

@Component({
  selector: 'kUpdateProfileSecret',
  templateUrl: './update-secret.component.html',
  styleUrls: ['./update-secret.component.scss'],
  providers: [
      KalturaLogger.createLogger('UpdateProfileSecretComponent')
  ]
})
  export class TeamsUpdateProfileSecretComponent {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onProfileSecretUpdated = new EventEmitter<TeamsIntegration>();

  public _profileForm: FormGroup;

  public _blockerMessage: AreaBlockerMessage = null;

    public get _saveDisabled(): boolean {
        return this._profileForm.pristine || !this._profileForm.valid;
    }

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger,
              private _teamsService: TeamsService,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._profileForm = this._fb.group({
        appClientSecret: ['', Validators.required]
    });
  }

  private updateFormStatus(status: 'touched' | 'pristine'): void {
      for (const controlName in this._profileForm.controls) {
          if (this._profileForm.controls.hasOwnProperty(controlName)) {
              if (status === 'touched') {
                  this._profileForm.get(controlName).markAsTouched();
              } else {
                  this._profileForm.get(controlName).markAsPristine();
              }
              this._profileForm.get(controlName).updateValueAndValidity();
          }
      }
      this._profileForm.updateValueAndValidity();
  }

  public _updateSecret(): void {
    this._blockerMessage = null;
    this._logger.info(`send update secret to the server`);

      if (!this._profileForm.valid) {
          this.updateFormStatus('touched');
          this._logger.info(`abort action, profile has invalid data`);
          return;
      }

      this.updateFormStatus('pristine');

    const { appClientSecret } = this._profileForm.value;
/*
    this._teamsService.updateProfileSecret(newProfile)
      .pipe(tag('block-shell'))
      .subscribe(
          (profile: TeamsIntegration) => {
              if (profile.objectType === "KalturaAPIException") { // error handling
                  this.displayServerError(profile);
                  return;
              }
              this.onProfileSecretUpdated.emit(profile);
              this.parentPopupWidget.close();
          },
          error => {
              this.displayServerError(error);
          }
      );*/
  }

    private displayServerError = error => {
        this._blockerMessage = new AreaBlockerMessage({
            message: error.message || 'Error creating Teams integration',
            buttons: [
                {
                    label: this._appLocalization.get('app.common.close'),
                    action: () => {
                        this._logger.info(`dismiss dialog`);
                        this._blockerMessage = null;
                    }
                }
            ]
        });
    }

}
