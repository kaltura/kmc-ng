import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AppAnalytics, BrowserService} from 'app-shared/kmc-shell';

@Component({
  selector: 'kKMCSsoForm',
  templateUrl: './sso-form.component.html',
  styleUrls: ['./sso-form.component.scss']
})
export class SsoFormComponent {
  @Input() inProgress: boolean;
  @Input() errorMessage: string;
  @Input()
  set authBrokerProfiles(value: any[]) {
      if (value.length > 0) {
          value.forEach(profile => this._profiles.push({label: profile.name, value: profile.id}));
          this._profileField.setValue(value[0].id);
      }
  }

  @Output() onSsoLogin = new EventEmitter<{email: string, organizationId: string, profileId: string}>();
  @Output() onRememberMe = new EventEmitter<string>();

  @Input()
  set username(value: string) {
      this._emailField.setValue(value || '');
      this._rememberMeField.setValue(!!value);
  };

  public _profiles: Array<{ value: string, label: string }> = [];

  public _ssoForm: FormGroup;
  public _emailField: AbstractControl;
  public _organizationField: AbstractControl;
  public _rememberMeField: AbstractControl;
  public _profileField: AbstractControl;
  public _displayEmailField = true;
  public _showOrganizationField = false;

  public get _emailValidationMessage(): string {
    return this._emailField.invalid && this._emailField.touched ? 'app.login.error.email' : '';
  }

  public get _resetBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.common.continue';
  }

  constructor(private _fb: FormBuilder,
              private _browserService: BrowserService,
              private _analytics: AppAnalytics) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._ssoForm = this._fb.group({
        email: ['', Validators.compose([Validators.required, Validators.email])],
        organization: [''],
        profile: [''],
        rememberMe: false
    });

    this._emailField = this._ssoForm.controls['email'];
    this._organizationField = this._ssoForm.controls['organization'];
    this._profileField = this._ssoForm.controls['profile'];
    this._rememberMeField = this._ssoForm.controls['rememberMe'];
  }

  public _ssoLogin(event: Event): void {
    event.preventDefault();
    this._analytics.trackClickEvent('Login_with_SSO');
    if (this._ssoForm.valid) {
      const rememberMePayload = this._rememberMeField.value ? this._emailField.value : '';
      this.onSsoLogin.emit({email: this._emailField.value, organizationId: this._organizationField.value, profileId: this._profileField.value});
      this.onRememberMe.emit(rememberMePayload);
    }
  }

}
