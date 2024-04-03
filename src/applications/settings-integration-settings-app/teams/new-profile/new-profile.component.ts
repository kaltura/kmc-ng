import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { tag } from '@kaltura-ng/kaltura-common';
import {TeamsIntegration, TeamsIntegrationSettings, TeamsService} from '../teams.service';
import {BrowserService} from 'app-shared/kmc-shell';

@Component({
  selector: 'kNewTeamsProfile',
  templateUrl: './new-profile.component.html',
  styleUrls: ['./new-profile.component.scss'],
  providers: [
      KalturaLogger.createLogger('NewRuleComponent')
  ]
})
  export class TeamsNewProfileComponent {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onProfileCreated = new EventEmitter<TeamsIntegration>();

  public _newProfileForm: FormGroup;

  public _blockerMessage: AreaBlockerMessage = null;

    public get _saveDisabled(): boolean {
        return this._newProfileForm.pristine || !this._newProfileForm.valid;
    }

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger,
              private _teamsService: TeamsService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._newProfileForm = this._fb.group({
      name: ['', Validators.required],
      tenantId: ['', Validators.required],
      appClientId: ['', Validators.required],
      appClientSecret: ['', Validators.required]
    });
  }

  private updateFormStatus(status: 'touched' | 'pristine'): void {
      for (const controlName in this._newProfileForm.controls) {
          if (this._newProfileForm.controls.hasOwnProperty(controlName)) {
              if (status === 'touched') {
                  this._newProfileForm.get(controlName).markAsTouched();
              } else {
                  this._newProfileForm.get(controlName).markAsPristine();
              }
              this._newProfileForm.get(controlName).updateValueAndValidity();
          }
      }
      this._newProfileForm.updateValueAndValidity();
  }

  public _createProfile(): void {
    this._blockerMessage = null;
    this._logger.info(`send create Teams profile to the server`);

      if (!this._newProfileForm.valid) {
          this.updateFormStatus('touched');
          this._logger.info(`abort action, profile has invalid data`);
          return;
      }

      this.updateFormStatus('pristine');

    const { name, tenantId, appClientId, appClientSecret } = this._newProfileForm.value;
    // default settings object
      const settings: TeamsIntegrationSettings = {
          uploadRecordings: true,
          uploadTranscripts: false,
          userIdSource: 'upn'
      }
    const newProfile = {
        teamsIntegration: {
            name,
            tenantId,
            appClientId,
            appClientSecret,
            settings
        }
    }

    this._teamsService.createProfile(newProfile)
      .pipe(tag('block-shell'))
      .subscribe(
          (profile: TeamsIntegration) => {
              if (profile.objectType === "KalturaAPIException") { // error handling
                  this.displayServerError(profile);
                  return;
              }
              this.onProfileCreated.emit(profile);
              this.parentPopupWidget.close();
          },
          error => {
              this.displayServerError(error);
          }
      );
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

    public openHelp(): void {
        this._browserService.openLink('https://knowledge.kaltura.com/help/kaltura-video-integration-with-teams');
    }
}
