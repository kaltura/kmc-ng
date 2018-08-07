import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { KalturaUser } from 'kaltura-ngx-client';
import { UserUpdateLoginDataActionArgs } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kEditUserName',
  templateUrl: './edit-user-name.component.html',
  styleUrls: ['./edit-user-name.component.scss'],
  providers: [KalturaLogger.createLogger('EditUserNameComponent')]
})
export class EditUserNameComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;
  @Input() blockerMessage: AreaBlockerMessage;
  @Output() updateLoginData = new EventEmitter<UserUpdateLoginDataActionArgs>();

  public _editUserNameForm: FormGroup;
  public _firstNameField: AbstractControl;
  public _lastNameField: AbstractControl;
  public _passwordField: AbstractControl;
  public _showPasswordError = false;

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger) {
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

    this._firstNameField = this._editUserNameForm.controls['firstName'];
    this._lastNameField = this._editUserNameForm.controls['lastName'];
    this._passwordField = this._editUserNameForm.controls['password'];
  }

  public _updateLoginData(): void {
    this._logger.info(`handle send update name action by user`);
    if (this._editUserNameForm.valid) {
      const formData = this._editUserNameForm.value;
      this.updateLoginData.emit({
        oldLoginId: this.user.email,
        password: formData.password,
        newFirstName: formData.firstName,
        newLastName: formData.lastName
      });
    } else {
      this._logger.info(`change name form is not valid, abort action`, { errors: this._editUserNameForm.errors });
      this._showPasswordError = true;
    }
  }
}
