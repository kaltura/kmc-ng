import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { MultiAccountStoreService } from '../multi-account-store/multi-account-store.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaPartner, KalturaUser} from 'kaltura-ngx-client';
import { KalturaUserRole } from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kNewAccount',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})

export class NewAccountComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() parentAccount: KalturaPartner;

  public _accountForm: FormGroup;
  public _adminField: AbstractControl;
  public _nameField: AbstractControl;
  public _emailField: AbstractControl;
  public _phoneField: AbstractControl;
  public _websiteField: AbstractControl;
  public _templateField: AbstractControl;
  public _refidField: AbstractControl;

  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _emailServerError = false;
  public _templatesList = [];

  constructor(public _accountStore: MultiAccountStoreService,
              private _formBuilder: FormBuilder,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    // build FormControl group
    this._accountForm = _formBuilder.group({
      admin: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phone: ['', Validators.required],
      website: '',
      template: '',
      refid: '',
    });

    this._adminField = this._accountForm.controls['admin'];
    this._nameField = this._accountForm.controls['name'];
    this._emailField = this._accountForm.controls['email'];
    this._phoneField = this._accountForm.controls['phone'];
    this._websiteField = this._accountForm.controls['website'];
    this._templateField = this._accountForm.controls['template'];
    this._refidField = this._accountForm.controls['refid'];
  }

  ngOnInit() {
      this._accountForm.reset({
          admin: '',
          name: '',
          email: '',
          phone: '',
          template: '',
          refid: ''
      });
    // init templates dropdown data
  }

  ngOnDestroy() {
  }

    private _markFormFieldsAsTouched(): void {
        for (const control in this._accountForm.controls) {
            if (this._accountForm.controls.hasOwnProperty(control)) {
                this._accountForm.get(control).markAsTouched();
                this._accountForm.get(control).updateValueAndValidity();
            }
        }
    }

    private _markFormFieldsAsPristine(): void {
        this._emailServerError = false;
        for (const control in this._accountForm.controls) {
            if (this._accountForm.controls.hasOwnProperty(control)) {
                this._accountForm.get(control).markAsPristine();
                this._accountForm.get(control).updateValueAndValidity();
            }
        }
    }

  private _createAccount(): void {
      if (!this._accountForm.valid) {
          return;
      }
      alert("create new account");
/*
    const { email } = this._accountForm.value;
    this._isBusy = true;
    this._usersStore.isUserAlreadyExists(email)
      .pipe(cancelOnDestroy(this))
      .subscribe((status) => {
        this._isBusy = false;

        if (status !== null) {
            switch (status) {
                case IsUserExistsStatuses.kmcUser:
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.attention'),
                        message: this._appLocalization.get('applications.administration.users.alreadyExistError', {0: email})
                    });
                    break;
                case IsUserExistsStatuses.otherKMCUser:
                    this._browserService.confirm({
                            header: this._appLocalization.get('applications.administration.users.alreadyExist'),
                            message: this._appLocalization.get('applications.administration.users.userAlreadyExist', {0: email}),
                            accept: () => this._createOrAssociateUser()
                        }
                    );
                    break;
                case IsUserExistsStatuses.unknownUser:
                    this._createOrAssociateUser();
                    break;
            }
        }else {
            this._blockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.administration.users.commonError'),
                buttons: [{
                    label: this._appLocalization.get('app.common.ok'),
                    action: () => this._blockerMessage = null
                }]
            });
        }
      });*/
  }


  public _templateSelected(event: any): void {
    alert("template selected");
  }

    public createNewAccount(): void {
        this._blockerMessage = null;

        if (this._accountForm.valid) {
            this._createAccount();
            this._markFormFieldsAsPristine();
        } else {
            this._markFormFieldsAsTouched();
        }
    }
}
