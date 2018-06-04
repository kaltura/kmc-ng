import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EqualFieldsValidator } from 'app-shared/kmc-shell/validators/equalFields.validator';

@Component({
  selector: 'kKMCRestorePassword',
  templateUrl: './restore-password-form.component.html',
  styleUrls: ['./restore-password-form.component.scss']
})
export class RestorePasswordFormComponent {
  @Input() errorMessage: string;
  @Input() errorCode: string;
  @Input() inProgress = false;
  @Input() restorePasswordHash: string;
  @Input() passwordRestored = false;

  @Output() onRestorePassword = new EventEmitter<{ newPassword: string, hashKey: string }>();
    @Output() returnToLogin = new EventEmitter<void>();

  public _formSent = false;
  public _resetPasswordForm: FormGroup;
  public _passwords: FormGroup;
  public _newPasswordField: AbstractControl;
  public _repeatPasswordField: AbstractControl;

  public get _sendBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.send';
  }

  public get _passwordsDontMatch(): boolean {
    return (this._repeatPasswordField.touched || this._formSent) && this._showError(this._passwords);
  }

  public get _passwordStructureInvalid(): boolean {
    return this._resetPasswordForm.pristine && 'PASSWORD_STRUCTURE_INVALID' === this.errorCode;
  }

  public get _passwordStructureInvalidMessage(): string {
    return this._passwordStructureInvalid  ? 'app.login.error.invalidStructure' : '';
  }

  constructor(private _fb: FormBuilder) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._resetPasswordForm = this._fb.group({
      passwords: this._fb.group({
        newPassword: ['', Validators.required],
        repeatPassword: ['', Validators.required],
      }, { validator: EqualFieldsValidator.validate('newPassword', 'repeatPassword') })
    });

    this._passwords = <FormGroup>this._resetPasswordForm.controls['passwords'];
    this._newPasswordField = this._passwords.controls['newPassword'];
    this._repeatPasswordField = this._passwords.controls['repeatPassword'];
  }

  private _markAsPristine(): void {
      for (const control in this._resetPasswordForm.controls) {
          if (this._resetPasswordForm.controls.hasOwnProperty(control)) {
              this._resetPasswordForm.controls[control].markAsUntouched();
              this._resetPasswordForm.controls[control].markAsPristine();
              this._resetPasswordForm.controls[control].updateValueAndValidity();
          }
      }
  }

  public _showError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || this._formSent);
  }

  public _getClientValidationMessage(control: AbstractControl): string {
    const invalid = this._showError(control);
    const message = control.hasError('fieldsEqual')
      ? 'app.login.restorePassword.error.equal'
      : 'app.login.restorePassword.error.required';
    return invalid ? message : '';
  }

  public _resetPassword(): void {
    this._formSent = true;

    if (this._resetPasswordForm.valid) {
      this._formSent = false;
        this._markAsPristine();
      const value = this._resetPasswordForm.value;
      this.onRestorePassword.emit({
        newPassword: value.passwords.newPassword,
        hashKey: this.restorePasswordHash
      });
    }
  }
}
