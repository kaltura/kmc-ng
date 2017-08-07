import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginScreen } from '../login.component';

@Component({
  selector: 'kKMCForgotPasswordForm',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss']
})
export class ForgotPasswordFormComponent {
  @Input() inProgress: boolean;
  @Input() errorMessage: string;
  @Input() set passwordReset(value: boolean) {
    if (value) {
      this.displayEmailField = this.inProgress = false;
    }
  }
  @Output() onSetScreen = new EventEmitter<LoginScreen>();
  @Output() onResetPassword = new EventEmitter<string>();

  forgotPasswordForm: FormGroup;
  emailField: AbstractControl;
  displayEmailField = true;

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  get emailValidationMessage() {
    return this.emailField.invalid && this.emailField.touched ? 'app.login.error.email' : '';
  }

  get resetBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.forgotPassword.send';
  }

  buildForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    });

    this.emailField = this.forgotPasswordForm.controls['email'];
  }

  resetPassword(event: Event) {
    event.preventDefault();

    if (this.forgotPasswordForm.valid) {
      this.inProgress = true;
      this.onResetPassword.emit(this.emailField.value);
    }
  }

  openLogin() {
    this.onSetScreen.emit(LoginScreen.Login);
  }

  get translateParam() {
    const value = this.emailField ? this.emailField.value : '';
    return { value };
  }
}
