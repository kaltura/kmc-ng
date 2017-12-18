import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {Entitlement, EntitlementService} from './entitlement.service';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import {BrowserService} from "app-shared/kmc-shell";

@Component({
  selector: 'kEntitlement',
  templateUrl: './entitlement.component.html',
  styleUrls: ['./entitlement.component.scss'],
  providers: [EntitlementService]
})
export class EntitlementComponent implements OnInit, OnDestroy {

  public _entitlements: KalturaCategory[];
  public _partnerDefaultEntitlementEnforcement: boolean;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _currentEditEntitlement: KalturaCategory = null;
  @ViewChild('editEntitlementPopup') editEntitlementPopup: PopupWidgetComponent;


  constructor(private _entitlementService: EntitlementService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._fetchEntitlements();
  }

  ngOnDestroy() {
  }

  public _onActionSelected({action, entitlement}: { action: string, entitlement: KalturaCategory }) {
    switch (action) {
      case 'edit':
        this._currentEditEntitlement = entitlement;
        this.editEntitlementPopup.open();
        break;

      case 'delete':
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.settings.integrationSettings.entitlement.deleteEntitlement.title'),
            message: this._appLocalization
              .get('applications.settings.integrationSettings.entitlement.deleteEntitlement.confirmation',
                {0: entitlement.name}),
            accept: () => {
              this._isBusy = true;
              this._entitlementService.deleteEntitlement(entitlement)
                .cancelOnDestroy(this)
                .subscribe(
                  result => {
                    this._fetchEntitlements();
                  },
                  error => {
                    this._isBusy = false;
                    this._blockerMessage =  error.message;
                  }
                );
            }
          }
        );
        break;
      default:
        break;
    }
  }

  private _fetchEntitlements() {
    this._isBusy = true;
    this._blockerMessage = null;
    this._entitlementService.getEntitlement()
      .cancelOnDestroy(this)
      .subscribe(
        (response: Entitlement) => {
          this._isBusy = false;
          this._entitlements = response.categories;
          this._partnerDefaultEntitlementEnforcement = response.partnerDefaultEntitlementEnforcement;
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.integrationSettings.entitlement.errors.loadError'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._fetchEntitlements()
              }
            ]
          });
        }
      );
  }
}
