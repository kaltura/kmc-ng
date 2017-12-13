import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { UserUpdateLoginDataActionArgs } from 'kaltura-ngx-client/api/types/UserUpdateLoginDataAction';

@Component({
  selector: 'kEditUserName',
  templateUrl: './edit-user-name.component.html',
  styleUrls: ['./edit-user-name.component.scss']
})
export class EditUserNameComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;
  @Input() blockerMessage: AreaBlockerMessage;
  @Output() updateLoginData = new EventEmitter<UserUpdateLoginDataActionArgs>();

  public _editUserNameForm: FormGroup;

  constructor(private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._editUserNameForm = this._fb.group({
      firstName: [this.user ? this.user.firstName : '', Validators.required],
      lastName: [this.user ? this.user.lastName : '', Validators.required],
      password: ['', Validators.required]
    });
  }

  public _closePopup() {
    this.parentPopupWidget.close();
  }

  public _updateLoginData(): void {
    if (this._editUserNameForm.valid) {
      const formData = this._editUserNameForm.value;
      this.updateLoginData.emit({
        oldLoginId: this.user.email,
        password: formData.password,
        newFirstName: formData.firstName,
        newLastName: formData.lastName
      });
    }
  }
}
