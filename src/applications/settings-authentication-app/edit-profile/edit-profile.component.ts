import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KalturaAPIException } from 'kaltura-ngx-client';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observer } from 'rxjs/Observer';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AuthProfile, ProfilesStoreService } from '../profiles-store/profiles-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kEditProfile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  providers: [
      KalturaLogger.createLogger('EditRoleComponent')
  ]
})
  export class EditProfileComponent implements OnInit {
  @Input() profile: AuthProfile;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onRefresh = new EventEmitter<void>();

  public _editProfileForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;

  public _blockerMessage: AreaBlockerMessage = null;

  public get _saveDisabled(): boolean {
    return this._editProfileForm.pristine;
  }

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger,
              private _profilesService: ProfilesStoreService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
      this._logger.info(`enter edit profile mode for existing profile`,{ id: this.profile.id, name: this.profile.name });
      this._editProfileForm.setValue({
        name: this.profile.name,
        description: this.profile.description
      }, { emitEvent: false });

  }

  private _buildForm(): void {
    this._editProfileForm = this._fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });

    this._nameField = this._editProfileForm.controls['name'];
    this._descriptionField = this._editProfileForm.controls['description'];
  }

    private _markFormFieldsAsTouched() {
        for (const controlName in this._editProfileForm.controls) {
            if (this._editProfileForm.controls.hasOwnProperty(controlName)) {
                this._editProfileForm.get(controlName).markAsTouched();
                this._editProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._editProfileForm.updateValueAndValidity();
    }

    private _markFormFieldsAsPristine() {
        for (const controlName in this._editProfileForm.controls) {
            if (this._editProfileForm.controls.hasOwnProperty(controlName)) {
                this._editProfileForm.get(controlName).markAsPristine();
                this._editProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._editProfileForm.updateValueAndValidity();
    }


    private _handleInvalidInputError(error: KalturaAPIException): void {
        if (error.args['PROPERTY_NAME'] === 'name') {
            this._nameField.setErrors({ unsafeValue: true });
        } else if (error.args['PROPERTY_NAME'] === 'description') {
            this._descriptionField.setErrors({ unsafeValue: true });
        }
    }

    private _getObserver(retryFn: () => void, successFn: () => void = null): Observer<void> {
    return <Observer<void>>{
      next: () => {
        if (typeof successFn === 'function') {
          successFn();
        }
        this._logger.info(`handle successful update by the server`);
        this.parentPopupWidget.close();
      },
      error: (error) => {
          if (error.code === 'UNSAFE_HTML_TAGS') {
              this._handleInvalidInputError(error);
              return;
          }

        this._logger.info(`handle failing update by the server`);
        this._blockerMessage = new AreaBlockerMessage(
          {
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`handle retry request by the user`);
                  retryFn();
                }
              },
              {
                label: this._appLocalization.get('app.common.dismiss'),
                action: () => {
                  this._logger.info(`handle dismiss request by the user`);
                  this.onRefresh.emit();
                  this.parentPopupWidget.close();
                }
              }
            ]
          }
        );
      },
      complete: () => {
        // empty by design
      }
    };
  }

  public _updateProfile(): void {
    this._blockerMessage = null;

    this._logger.info(`send updated profile to the server`);

    const { name, description } = this._editProfileForm.value;
    const updatedProfile = Object.assign(this.profile, {name, description});
    const retryFn = () => this._updateProfile();
    const successFn = () => {
        this.onRefresh.emit();
    };

    this._profilesService.updateProfile(updatedProfile)
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn, successFn));
  }

  public _addProfile(): void {
    this._blockerMessage = null;

    this._logger.info(`send new profile to the server`);

    const retryFn = () => this._addProfile();
    const { name, description } = this._editProfileForm.value;
    const profile = { name, description };

    // this._profilesService.addRole(this.profile)
    //   .pipe(cancelOnDestroy(this))
    //   .pipe(tag('block-shell'))
    //   .subscribe(this._getObserver(retryFn));
  }

  public _performAction(): void {
    this._logger.info(`handle save request by the user`);
    if (!this._editProfileForm.valid) {
      this._markFormFieldsAsTouched();
      this._logger.info(`abort action, profile has invalid data`);
      return;
    }

    this._markFormFieldsAsPristine();

    if (this.profile && this.profile.id) {
      this._updateProfile();
    } else {
      this._addProfile();
    }
  }

}
