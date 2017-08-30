import {Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {ISubscription} from 'rxjs/Subscription';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BrowserService} from 'app-shared/kmc-shell';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kChangeAccount',
  templateUrl: './change-account.component.html',
  styleUrls: ['./change-account.component.scss']
})
export class ChangeAccountComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;


  public changeAccountForm: FormGroup;
  private _parentPopupStateChangeSubscribe: ISubscription;
  constructor(private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            // this._resetForm();
            // this._confirmClose = true;
            // this._uploadFileName = '';
            // this._validationErrorMsg = '';
            // this.fileToUpload = null;
            // this.changeAccountForm.get('label').setValue(this.currentCaption.label);
            // this.changeAccountForm.get('language').setValue(KalturaUtils.getCodeByLanguage(this.currentCaption.language.toString()).toUpperCase());
            // this.changeAccountForm.get('format').setValue(this.currentCaption.format);
          }
        });
    }
  }

  ngOnDestroy() {
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }

  public _saveAndClose(): void {
    const context = this.changeAccountForm.get('account').value; // pass selected account
    this.parentPopupWidget.close(context);
  }


  private _createForm(): void {
    this.changeAccountForm = this._fb.group({
      account: 'upload',
    });
  }
}

