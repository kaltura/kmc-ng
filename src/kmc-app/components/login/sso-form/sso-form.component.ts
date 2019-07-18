import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kKMCSsoForm',
  templateUrl: './sso-form.component.html',
  styleUrls: ['./sso-form.component.scss']
})
export class SsoFormComponent {
  @Input() inProgress: boolean;
  @Input() errorMessage: string;
  
  @Output() onSsoLogin = new EventEmitter<string>();
  @Output() onRememberMe = new EventEmitter<string>();

  @Input()
  set username(value: string) {
      this._emailField.setValue(value || '');
      this._rememberMeField.setValue(!!value);
  };

  public _ssoForm: FormGroup;
  public _emailField: AbstractControl;
  public _rememberMeField: AbstractControl;
  public _displayEmailField = true;

  public get _emailValidationMessage(): string {
    return this._emailField.invalid && this._emailField.touched ? 'app.login.error.email' : '';
  }

  public get _resetBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.common.continue';
  }

  constructor(private _fb: FormBuilder, private _browserService: BrowserService) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._ssoForm = this._fb.group({
        email: ['', Validators.compose([Validators.required, Validators.email])],
        rememberMe: false
    });

    this._emailField = this._ssoForm.controls['email'];
    this._rememberMeField = this._ssoForm.controls['rememberMe'];
  }

  public _ssoLogin(event: Event): void {
    event.preventDefault();
    if (this._ssoForm.valid) {
      const rememberMePayload = this._rememberMeField.value ? this._emailField.value : '';
      this.onSsoLogin.emit(this._emailField.value);
      this.onRememberMe.emit(rememberMePayload);
    }
  }

}
