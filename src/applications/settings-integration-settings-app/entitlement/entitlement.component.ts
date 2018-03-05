import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {EntitlementSectionData, EntitlementService} from './entitlement.service';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import {BrowserService} from "app-shared/kmc-shell";
import { serverConfig } from 'config/server';

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
    this._loadEntitlementSectionData();
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
              this._deleteEntitlement(entitlement);
            }
          }
        );
        break;
      default:
        break;
    }
  }

  private _deleteEntitlement(entitlement: KalturaCategory) {
    this._updateAreaBlockerState(true, null);
    this._entitlementService.deleteEntitlement({
      id: entitlement.id,
      privacyContextData: {
        privacyContexts: entitlement.privacyContexts,
        privacyContext: entitlement.privacyContext
      }
    })
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          this._updateAreaBlockerState(false, null);
          this._loadEntitlementSectionData();
        },
        error => {
          const blockerMessage = new AreaBlockerMessage({
            message: error.message || `Error occurred while trying to delete entitlement \'${entitlement.name}\'`,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._deleteEntitlement(entitlement);
                }
              }, {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private _loadEntitlementSectionData() {
    this._updateAreaBlockerState(true, null);
    this._entitlementService.getEntitlementsSectionData()
      .cancelOnDestroy(this)
      .subscribe(
        (response: EntitlementSectionData) => {
          this._updateAreaBlockerState(false, null);
          this._entitlements = response.categories;
          this._partnerDefaultEntitlementEnforcement = response.partnerDefaultEntitlementEnforcement;
        },
        error => {
          const blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.integrationSettings.entitlement.errors.loadError'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._loadEntitlementSectionData()
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private _updateAreaBlockerState(isBusy: boolean, areaBlocker: AreaBlockerMessage): void {
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }

  public openLink(): void {
    this._browserService.openLink(serverConfig.externalLinks.entitlements.manage);
  }

}
