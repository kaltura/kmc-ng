import {Component, OnDestroy, OnInit} from '@angular/core';
import {KalturaCategory} from "kaltura-ngx-client/api/types/KalturaCategory";
import {Entitlement, EntitlementService} from "./entitlement.service";
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";
import {AppLocalization} from "@kaltura-ng/kaltura-common";

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
  public _isBusy: boolean = false;

  constructor(private _entitlementService: EntitlementService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._fetchEntitlements();
  }

  ngOnDestroy() {
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
