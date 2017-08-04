import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'kKMCLoginForm',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  @Input() inProgress = false;
  @Input() errorMessage: string;
  @Output() onLogin = new EventEmitter<{ username: string, password: string }>();
  @Output() onRememberMe = new EventEmitter<string>();

  @Input()
  set username(value: string) {
    this.usernameField.setValue(value || '');
    this.rememberMeField.setValue(!!value);
  };

  loginForm: FormGroup;
  usernameField: AbstractControl;
  passwordField: AbstractControl;
  rememberMeField: AbstractControl;

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  showError(control: AbstractControl) {
    return control.invalid && control.touched;
  }

  showSuccess(control: AbstractControl) {
    return control.valid && control.dirty;
  }

  get loginValidationMessage(): string {
    return this.showError(this.usernameField) ? 'Wrong email format' : '';
  }

  get loginBtnText(): string {
    return this.inProgress ? 'app.login.wait' : 'app.login.login';
  }

  buildForm(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
      ])],
      rememberMe: false
    });

    this.usernameField = this.loginForm.controls['username'];
    this.passwordField = this.loginForm.controls['password'];
    this.rememberMeField = this.loginForm.controls['rememberMe']
  }

  login(event: Event): void {
    event.preventDefault();

    if (this.loginForm.valid) {
      const rememberMePayload = this.rememberMeField.value ? this.usernameField.value : '';
      const loginPayload = {
        username: this.usernameField.value,
        password: this.passwordField.value
      };

      this.onLogin.emit(loginPayload);
      this.onRememberMe.emit(rememberMePayload);
    }
  }
}
