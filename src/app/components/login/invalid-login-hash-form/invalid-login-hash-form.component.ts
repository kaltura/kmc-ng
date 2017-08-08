import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginScreens } from '../login.component';

@Component({
  selector: 'kKMCInvalidLoginHash',
  templateUrl: './invalid-login-hash-form.component.html',
  styleUrls: ['./invalid-login-hash-form.component.scss']
})
export class InvalidLoginHashFormComponent {
  @Input() inProgress: boolean;
  @Input() errorMessage: string;

  @Input()
  set passwordReset(value: boolean) {
    if (value) {
      this._displayEmailField = this.inProgress = false;
    }
  }

  @Output() onSetScreen = new EventEmitter<LoginScreens>();
  @Output() onResendLink = new EventEmitter<string>();

  public _resendLinkForm: FormGroup;
  public _emailField: AbstractControl;
  public _displayEmailField = true;

  public get _emailValidationMessage(): string {
    return this._emailField.invalid && this._emailField.touched ? 'app.login.error.email' : '';
  }

  public get _resendBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.send';
  }


  public get _translateParam(): { value: string } {
    const value = this._emailField ? this._emailField.value : '';
    return { value };
  }

  constructor(private fb: FormBuilder) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._resendLinkForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    });

    this._emailField = this._resendLinkForm.controls['email'];
  }

  public _resetPassword(event: Event): void {
    event.preventDefault();

    if (this._resendLinkForm.valid) {
      this.onResendLink.emit(this._emailField.value);
    }
  }
}
