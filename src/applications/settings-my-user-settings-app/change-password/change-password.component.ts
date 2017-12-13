import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';

@Component({
  selector: 'kChangePassword',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})

export class ChangePasswordComponent implements OnInit, OnDestroy {

  public changePasswordForm: FormGroup;
  _isBusy = false;
  _blockerMessage: AreaBlockerMessage = null;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;
  @Output() doUpdateLoginData = new EventEmitter<any>();

  constructor(private _fb: FormBuilder) {
  }

  private _closePopup() {
    this.parentPopupWidget.close();
  }

  private _passwordMatchValidator(g: FormGroup) {
    return g.parent && g.parent.value.newPassword === g.value ? null : { 'mismatch': true };
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this.changePasswordForm = this._fb.group({
      currentPassword: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(200)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(200)])],
      reTypeNewPassword: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(200), this._passwordMatchValidator])]
    });
  }

  public updateLoginData(): void {
    let formData: any = this.changePasswordForm.value;
    this.doUpdateLoginData.emit({
      oldLoginId: this.user.email,
      password: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {
  }
}
