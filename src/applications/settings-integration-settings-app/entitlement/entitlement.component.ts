import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client';
import {EntitlementSectionData, EntitlementService} from './entitlement.service';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from "app-shared/kmc-shell";
import { serverConfig } from 'config/server';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kEntitlement',
  templateUrl: './entitlement.component.html',
  styleUrls: ['./entitlement.component.scss'],
  providers: [
    EntitlementService,
    KalturaLogger.createLogger('EntitlementComponent')
  ]
})
export class EntitlementComponent implements OnInit, OnDestroy {

  public _entitlements: KalturaCategory[];
  public _partnerDefaultEntitlementEnforcement: boolean;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _currentEditEntitlement: KalturaCategory = null;
  public _kmcPermissions = KMCPermissions;
  public _manageHelpLinkExists = !!serverConfig.externalLinks.entitlements && !!serverConfig.externalLinks.entitlements.manage;

  @ViewChild('editEntitlementPopup') editEntitlementPopup: PopupWidgetComponent;
  @ViewChild('addNewEntitlement') addEntitlementPopup: PopupWidgetComponent;


  constructor(private _entitlementService: EntitlementService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _settingsIntegrationSettingsMainView: SettingsIntegrationSettingsMainViewService,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
      if (this._settingsIntegrationSettingsMainView.isAvailable()) {
          this._loadEntitlementSectionData();
      }
  }

  ngOnDestroy() {
  }

  public _onActionSelected({action, entitlement}: { action: string, entitlement: KalturaCategory }) {
    switch (action) {
      case 'edit':
        this._logger.info(`handle edit entitlement action by user`, { id: entitlement.id, name: entitlement.name });
        this._currentEditEntitlement = entitlement;
        this.editEntitlementPopup.open();
        break;

      case 'delete':
        this._logger.info(`handle delete entitlement action by user, show confirmation dialog`);
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.settings.integrationSettings.entitlement.deleteEntitlement.title'),
            message: this._appLocalization
              .get('applications.settings.integrationSettings.entitlement.deleteEntitlement.confirmation',
                {0: entitlement.name}),
            accept: () => {
              this._logger.info(`user confirmed, proceed action`);
              this._deleteEntitlement(entitlement);
            },
            reject: () => {
              this._logger.info(`user didn't confirm, abort action`);
            }
          }
        );
        break;
      default:
        break;
    }
  }

  private _deleteEntitlement(entitlement: KalturaCategory) {
    this._logger.info(`handle delete entitlement request by user`);
    this._updateAreaBlockerState(true, null);
    this._entitlementService.deleteEntitlement({
      id: entitlement.id,
      privacyContextData: {
        privacyContexts: entitlement.privacyContexts,
        privacyContext: entitlement.privacyContext
      }
    })
      .pipe(cancelOnDestroy(this))
      .subscribe(
        result => {
          this._logger.info(`handle successful delete entitlement request by user`);
          this._updateAreaBlockerState(false, null);
          this._loadEntitlementSectionData();
        },
        error => {
          this._logger.info(`handle failed delete entitlement request by user, show confirmation`, { error: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: error.message || `Error occurred while trying to delete entitlement \'${entitlement.name}\'`,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._deleteEntitlement(entitlement);
                }
              }, {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._logger.info(`user canceled, dismiss dialog`);
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
    this._logger.info(`handle loading entitlement data`);
    this._updateAreaBlockerState(true, null);
    this._entitlementService.getEntitlementsSectionData()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        (response: EntitlementSectionData) => {
          this._logger.info(`handle successful loading entitlement data`);
          this._updateAreaBlockerState(false, null);
          this._entitlements = response.categories;
          this._partnerDefaultEntitlementEnforcement = response.partnerDefaultEntitlementEnforcement;
        },
        error => {
          this._logger.warn(`handle failed loading entitlement data, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.integrationSettings.entitlement.errors.loadError'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._loadEntitlementSectionData();
                }
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private _updateAreaBlockerState(isBusy: boolean, areaBlocker: AreaBlockerMessage): void {
    this._logger.debug(`update areablocker state`, { isBusy, message: areaBlocker ? areaBlocker.message : null });
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }

  public openLink(): void {
    this._logger.info(`handle opening of entitlement help link`, { link: serverConfig.externalLinks.entitlements.manage });
    this._browserService.openLink(serverConfig.externalLinks.entitlements.manage);
  }

  public _addEntitlement(): void {
    this._logger.info(`handle add entitlement action by user`);
    this.addEntitlementPopup.open();
  }
}
