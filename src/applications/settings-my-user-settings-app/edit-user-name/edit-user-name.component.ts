import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { PopupWidgetComponent } from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
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

  constructor(
    private _fb: FormBuilder
  ) {}

  private _closePopup() {
    this.parentPopupWidget.close();
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {}

  // Create empty structured form on loading
  private _createForm(): void {
    this.editUserNameForm = this._fb.group({
      firstName:  ['', Validators.required],
      lastName:   ['', Validators.required],
      password:   ['', Validators.required]
    });
  }

  private markFormFieldsAsTouched() {
    for (let inner in this.editUserNameForm.controls) {
      this.editUserNameForm.get(inner).markAsTouched();
      this.editUserNameForm.get(inner).updateValueAndValidity();
    }
  }
}
