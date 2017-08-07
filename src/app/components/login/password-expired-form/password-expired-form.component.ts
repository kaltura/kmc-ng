import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EqualFieldsValidator } from 'app-shared/kmc-shell/validators/equalFields.validator';

@Component({
  selector: 'kKMCPasswordExpiredForm',
  templateUrl: './password-expired-form.component.html',
  styleUrls: ['./password-expired-form.component.scss']
})
export class PasswordExpiredFormComponent {
  @Input() errorMessage: string;
  @Input() inProgress = false;
  @Output() onResetPassword = new EventEmitter<{ password: string, newPassword: string }>();

  resetPasswordForm: FormGroup;
  passwords: FormGroup;
  oldPasswordField: AbstractControl;
  newPasswordField: AbstractControl;
  repeatPasswordField: AbstractControl;
  formSent = false;

  get sendBtnText() {
    return this.inProgress ? 'app.login.wait' : 'app.login.send';
  }

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  showError(control: AbstractControl) {
    return control.invalid && (control.touched || this.formSent);
  }

  getClientValidationMessage(control: AbstractControl) {
    const invalid = this.showError(control);
    const message = control.hasError('fieldsEqual')
      ? 'app.login.passwordExpired.error.equal'
      : 'app.login.passwordExpired.error.required';

    return invalid ? message : '';
  }

  buildForm() {
    this.resetPasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      passwords: this.fb.group({
        newPassword: ['', Validators.required],
        repeatPassword: ['', Validators.required],
      }, { validator: EqualFieldsValidator.validate('newPassword', 'repeatPassword') })
    });

    this.oldPasswordField = this.resetPasswordForm.controls['oldPassword'];
    this.passwords = <FormGroup>this.resetPasswordForm.controls['passwords'];
    this.newPasswordField = this.passwords.controls['newPassword'];
    this.repeatPasswordField = this.passwords.controls['repeatPassword'];
  }

  resetPassword(event: Event) {
    event.preventDefault();

    this.formSent = true;

    if (this.resetPasswordForm.valid) {
      this.onResetPassword.emit({
        password: this.oldPasswordField.value,
        newPassword: this.newPasswordField.value
      });
    }
  }
}
