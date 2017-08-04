import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'kKMCForgotPasswordForm',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss']
})
export class ForgotPasswordFormComponent {
  @Input() inProgress: boolean;
  @Input() errorMessage: string;

  forgotPasswordForm: FormGroup;
  emailField: AbstractControl;

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
  }
}
