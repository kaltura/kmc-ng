import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { PopupWidgetComponent } from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
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

  constructor(
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {}

  // Create empty structured form on loading
  private _createForm(): void {
    this.editEmailAddressForm = this._fb.group({
      email:    ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.required]
    });
  }

  private markFormFieldsAsTouched() {
    for (let inner in this.editEmailAddressForm.controls) {
      this.editEmailAddressForm.get(inner).markAsTouched();
      this.editEmailAddressForm.get(inner).updateValueAndValidity();
    }
  }
}
