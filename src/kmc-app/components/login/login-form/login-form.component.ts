import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginScreens } from '../login.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { serverConfig } from 'config/server';

@Component({
  selector: 'kKMCLoginForm',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  @Input() inProgress = false;
  @Input() errorMessage: string;
  @Input() showAuthenticationCode = false;

  @Input()
  set errorCode(value: string) {
    this._errorCode = value;
    if (value === 'MISSING_OTP') {
        this.showAuthenticationCode = true;
        setTimeout(() => {
            this.authField.nativeElement.focus();
        },100)
    }
  };

  @Input()
  set username(value: string) {
    this._usernameField.setValue(value || '');
    this._rememberMeField.setValue(!!value);
  };

  @Output() onLogin = new EventEmitter<{ username: string, password: string }>();
  @Output() onRememberMe = new EventEmitter<string>();
  @Output() onSetScreen = new EventEmitter<LoginScreens>();

  @ViewChild('auth') authField;

  _loginForm: FormGroup;
  _usernameField: AbstractControl;
  _authenticationField: AbstractControl;
  _passwordField: AbstractControl;
  _rememberMeField: AbstractControl;
  _supportAddress: string;
  _errorCode: string;

  public get _loginValidationMessage(): string {
    return this._showError(this._usernameField) ? 'app.login.error.email' : '';
  }

  public get _loginBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.login.title';
  }

  constructor(private _fb: FormBuilder,
              private _browserService: BrowserService) {
      this.buildForm();

      if (serverConfig.externalLinks.kaltura && serverConfig.externalLinks.kaltura.support) {
          this._supportAddress = serverConfig.externalLinks.kaltura.support;
      }
  }

  private buildForm(): void {
    this._loginForm = this._fb.group({
      username: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
      ])],
      authentication: ['', Validators.required],
      rememberMe: false
    });

    this._usernameField = this._loginForm.controls['username'];
    this._passwordField = this._loginForm.controls['password'];
    this._authenticationField = this._loginForm.controls['authentication'];
    this._rememberMeField = this._loginForm.controls['rememberMe']
  }

  _showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  _showSuccess(control: AbstractControl): boolean {
    return control.valid && control.dirty;
  }

  _login(event: Event): void {
    event.preventDefault();

    if (this._usernameField.valid && this._passwordField.valid) {
      const rememberMePayload = this._rememberMeField.value ? this._usernameField.value : '';
      const loginPayload = {
        username: this._usernameField.value,
        password: this._passwordField.value,
        otp: this._authenticationField.value || ''
      };

      this.onLogin.emit(loginPayload);
      this.onRememberMe.emit(rememberMePayload);
    }
  }

  _forgotPassword(): void {
    this.onSetScreen.emit(LoginScreens.ForgotPassword);
  }

  public _contactSupport(): void {
      this._browserService.openSupport();
  }

}
