import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';

export enum PrivacyMode {
  NoRestriction = 0,
  RequiresAuthentication = 1,
  Private = 2
}

@Component({
  selector: 'kCategoriesBulkChangeContentPrivacy',
  templateUrl: './bulk-change-content-privacy.component.html',
  styleUrls: ['./bulk-change-content-privacy.component.scss']
})

export class CategoriesBulkChangeContentPrivacy implements OnInit, OnDestroy, AfterViewInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() changeContentPrivacyChanged = new EventEmitter<PrivacyMode>();

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;

  private _parentPopupStateChangeSubscribe: ISubscription;
  private _confirmClose: boolean = true;

  // expose enum to the template
  public _privacyModes = PrivacyMode;
  public _privacyMode = null;

  constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this._privacyMode && this._confirmClose) {
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                      this._confirmClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }


  public _apply() {
    this.changeContentPrivacyChanged.emit(this._privacyMode);
    this._confirmClose = false;
    this.parentPopupWidget.close();
  }
}

