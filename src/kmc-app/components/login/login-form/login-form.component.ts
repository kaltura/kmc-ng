import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() errorCode: string;

  @Input()
  set username(value: string) {
    this._usernameField.setValue(value || '');
    this._rememberMeField.setValue(!!value);
  };

  @Output() onLogin = new EventEmitter<{ username: string, password: string }>();
  @Output() onRememberMe = new EventEmitter<string>();
  @Output() onSetScreen = new EventEmitter<LoginScreens>();

  _loginForm: FormGroup;
  _usernameField: AbstractControl;
  _passwordField: AbstractControl;
  _rememberMeField: AbstractControl;

    public get _supportAddress(): string {
        const supportAddress = serverConfig.externalLinks.kaltura.support;
        return supportAddress.replace('mailto:', '');
    }

  public get _loginValidationMessage(): string {
    return this._showError(this._usernameField) ? 'app.login.error.email' : '';
  }

  public get _loginBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.login.title';
  }

  constructor(private _fb: FormBuilder,
              private _browserService: BrowserService) {
    this.buildForm();
  }

  private buildForm(): void {
    this._loginForm = this._fb.group({
      username: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
      ])],
      rememberMe: false
    });

    this._usernameField = this._loginForm.controls['username'];
    this._passwordField = this._loginForm.controls['password'];
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

    if (this._loginForm.valid) {
      const rememberMePayload = this._rememberMeField.value ? this._usernameField.value : '';
      const loginPayload = {
        username: this._usernameField.value,
        password: this._passwordField.value
      };

      this.onLogin.emit(loginPayload);
      this.onRememberMe.emit(rememberMePayload);
    }
  }

  _forgotPassword(): void {
    this.onSetScreen.emit(LoginScreens.ForgotPassword);
  }

  public _contactSupport(): void {
      this._browserService.openEmail(serverConfig.externalLinks.kaltura.support);
  }
}
