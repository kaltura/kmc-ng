import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'kInvalidRetorePasswordHash',
    templateUrl: './invalid-restore-password-hash-form.component.html',
    styleUrls: ['./invalid-restore-password-hash-form.component.scss']
})
export class InvalidRestorePasswordHashFormComponent {
    @Input() inProgress: boolean;
    @Input() errorCode: string;
    @Input() errorMessage: string;

    @Input()
    set passwordReset(value: boolean) {
        if (value) {
            this._displayEmailField = this.inProgress = false;
        }
    }

    @Output() returnToLogin = new EventEmitter<void>();
    @Output() resendRestorePassword = new EventEmitter<string>();

    public _resendLinkForm: FormGroup;
    public _emailField: AbstractControl;
    public _displayEmailField = true;

    public get _emailValidationMessage(): string {
        return this._emailField.invalid && this._emailField.touched ? 'app.login.error.email' : '';
    }

    public get _resendBtnText(): string {
        return this.inProgress ? 'app.login.wait' : 'app.login.send';
    }


    public get _translateParam(): [string] {
        return [this._emailField ? this._emailField.value : ''];
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

    public _resetPassword(): void {
        if (this._resendLinkForm.valid) {
            const { email } = this._resendLinkForm.value;
            this.resendRestorePassword.emit(email);
        }
    }
}
