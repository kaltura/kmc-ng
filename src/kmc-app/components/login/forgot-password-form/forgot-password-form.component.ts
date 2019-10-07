import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginScreens } from '../login.component';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { serverConfig } from 'config/server';

@Component({
  selector: 'kKMCForgotPasswordForm',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss']
})
export class ForgotPasswordFormComponent {
  @Input() inProgress: boolean;
  @Input() errorMessage: string;

  @Input()
  set passwordReset(value: boolean) {
    if (value) {
      this._displayEmailField = false;
    }
  }

  @Output() onSetScreen = new EventEmitter<LoginScreens>();
  @Output() onResetPassword = new EventEmitter<string>();

  public _forgotPasswordForm: FormGroup;
  public _emailField: AbstractControl;
  public _displayEmailField = true;
  public _contactUsLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.contactUs;

  public get _emailValidationMessage(): string {
    return this._emailField.invalid && this._emailField.touched ? 'app.login.error.email' : '';
  }

  public get _resetBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.send';
  }

  constructor(private _fb: FormBuilder, private _browserService: BrowserService) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._forgotPasswordForm = this._fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    });

    this._emailField = this._forgotPasswordForm.controls['email'];
  }

  public _resetPassword(event: Event): void {
    event.preventDefault();

    if (this._forgotPasswordForm.valid) {
      this.onResetPassword.emit(this._emailField.value);
    }
  }

  public _openLogin(): void {
    this.onSetScreen.emit(LoginScreens.Login);
  }

  public _openContactUs(): void {
    this._browserService.openLink(serverConfig.externalLinks.kaltura.contactUs);
  }
}
