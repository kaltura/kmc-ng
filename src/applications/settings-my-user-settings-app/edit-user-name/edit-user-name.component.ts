import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { PopupWidgetComponent } from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Component({
  selector: 'kEditUserName',
  templateUrl: './edit-user-name.component.html',
  styleUrls: ['./edit-user-name.component.scss']
})
export class EditUserNameComponent implements OnInit, OnDestroy {

  public editUserNameForm: FormGroup;
  _isBusy = false;
  _blockerMessage: AreaBlockerMessage = null;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;
  @Output() doUpdateLoginData = new EventEmitter<any>();

  constructor(
    private _fb: FormBuilder
  ) {}

  private _closePopup() {
    this.parentPopupWidget.close();
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this.editUserNameForm = this._fb.group({
      firstName:  [this.user ? this.user.firstName : '', Validators.required],
      lastName:   [this.user ? this.user.lastName : '', Validators.required],
      password:   ['', Validators.required]
    });
  }

  public updateLoginData(): void {
    let formData: any = this.editUserNameForm.value;
    this.doUpdateLoginData.emit({
      oldLoginId:   this.user.email,
      password:     formData.password,
      newFirstName: formData.firstName,
      newLastName:  formData.lastName
    });
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {}
}
