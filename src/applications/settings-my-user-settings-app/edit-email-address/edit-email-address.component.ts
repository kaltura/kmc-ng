import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { PopupWidgetComponent } from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Component({
  selector: 'kEditEmailAddress',
  templateUrl: './edit-email-address.component.html',
  styleUrls: ['./edit-email-address.component.scss']
})
export class EditEmailAddressComponent implements OnInit, OnDestroy {

  public editEmailAddressForm: FormGroup;
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
    this.editEmailAddressForm = this._fb.group({
      email:    [this.user ? this.user.email : '', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.required]
    });
  }

  public updateLoginData(): void {
    let formData: any = this.editEmailAddressForm.value;
    this.doUpdateLoginData.emit({
      oldLoginId:   this.user.email,
      password:     formData.password,
      newLoginId:   formData.email
    });
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {}
}
