import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { UserUpdateLoginDataActionArgs } from 'kaltura-ngx-client/api/types/UserUpdateLoginDataAction';

@Component({
  selector: 'kChangePassword',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;
  @Input() blockerMessage: AreaBlockerMessage;

  @Output() updateLoginData = new EventEmitter<UserUpdateLoginDataActionArgs>();

  public _changePasswordForm: FormGroup;

  constructor(private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {
  }

  private _passwordMatchValidator(g: FormGroup): ValidationErrors | null {
    return g.parent && g.parent.value.newPassword === g.value ? null : { 'mismatch': true };
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._changePasswordForm = this._fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      reTypeNewPassword: ['', Validators.compose([Validators.required, this._passwordMatchValidator])]
    });
  }

  public _closePopup(): void {
    this.parentPopupWidget.close();
  }

  public _updateLoginData(): void {
    if (this._changePasswordForm.valid) {
      const formData = this._changePasswordForm.value;
      this.updateLoginData.emit({
        oldLoginId: this.user.email,
        password: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    }
  }
}
