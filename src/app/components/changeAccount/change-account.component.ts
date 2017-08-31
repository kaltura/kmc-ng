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
export class ChangeAccountComponent implements OnInit{

  @Input() parentPopupWidget: PopupWidgetComponent;


  public changeAccountForm: FormGroup;
  constructor(private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();
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

