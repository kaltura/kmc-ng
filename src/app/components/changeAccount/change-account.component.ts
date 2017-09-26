import {Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {ISubscription} from 'rxjs/Subscription';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {PartnerListPartnersForUserAction} from 'kaltura-typescript-client/types/PartnerListPartnersForUserAction';
import {KalturaPartnerFilter} from 'kaltura-typescript-client/types/KalturaPartnerFilter';
import {KalturaPartnerStatus} from 'kaltura-typescript-client/types/KalturaPartnerStatus';
import {Observable} from 'rxjs/Observable';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kChangeAccount',
  templateUrl: './change-account.component.html',
  styleUrls: ['./change-account.component.scss']
})
export class ChangeAccountComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;

  public partners: { 'id': number, 'name': string }[];
  public changeAccountForm: FormGroup;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _currentPartnerId: number;

  constructor(private _fb: FormBuilder,
              private _appLocalization: AppLocalization,
              private _kalturaServerClient: KalturaClient,
              private _userAuthentication: AppAuthentication) {
  }

  ngOnInit() {
    this._currentPartnerId = this._userAuthentication.appUser.partnerId;
    this._createForm();
    this.loadAvailablePartners();
  }

  private loadAvailablePartners() {
    this._isBusy = true;
    this.getAvailablePartners()
      .subscribe(partners => {
          this.partners = partners;
          this._isBusy = false;
          this._blockerMessage = null;
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('app.changeAccount.errors.loadPartners'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.loadAvailablePartners();
                  }
                }
              ]
            }
          );
        });
  }

  public _saveAndClose(): void {
    const account = this.changeAccountForm.get('account').value; // pass selected account
    // this.parentPopupWidget.close(account);
    this._isBusy = true;
    this._userAuthentication.loginByKs(account)
      .subscribe(() => {
          this._isBusy = false;
          this._blockerMessage = null;
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._isBusy = false;
                this._blockerMessage = null;
              }
            }]
          });
        });
  }


  private _createForm(): void {
    this.changeAccountForm = this._fb.group({
      account: this._userAuthentication.appUser.partnerId,
    });
  }

  private getAvailablePartners(): Observable<{ 'id': number, 'name': string }[]> {
    const filter = new KalturaPartnerFilter({
      statusEqual: KalturaPartnerStatus.active
    });

    return this._kalturaServerClient.request(new PartnerListPartnersForUserAction({
      partnerFilter: filter
    }))
      .map(data => {
        return data.objects.map(partner => ({'id': partner.id, 'name': partner.name}))
      });
  }
}

