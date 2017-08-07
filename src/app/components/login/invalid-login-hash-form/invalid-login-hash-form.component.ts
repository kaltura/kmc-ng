import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginScreen } from '../login.component';

@Component({
  selector: 'kKMCInvalidLoginHash',
  templateUrl: './invalid-login-hash-form.component.html',
  styleUrls: ['./invalid-login-hash-form.component.scss']
})
export class InvalidLoginHashFormComponent {
  @Input() inProgress: boolean;
  @Input() errorMessage: string;
  @Input() set passwordReset(value: boolean) {
    if (value) {
      this.displayEmailField = this.inProgress = false;
    }
  }
  @Output() onSetScreen = new EventEmitter<LoginScreen>();
  @Output() onResendLink = new EventEmitter<string>();

  resendLinkForm: FormGroup;
  emailField: AbstractControl;
  displayEmailField = true;

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  get emailValidationMessage() {
    return this.emailField.invalid && this.emailField.touched ? 'app.login.error.email' : '';
  }

  get resendBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.send';
  }

  buildForm() {
    this.resendLinkForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    });

    this.emailField = this.resendLinkForm.controls['email'];
  }

  resetPassword(event: Event) {
    event.preventDefault();

    if (this.resendLinkForm.valid) {
      this.onResendLink.emit(this.emailField.value);
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
