import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { BrowserService } from 'app-shared/kmc-shell';

import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { EntryLiveWidget } from './entry-live-widget.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

import { serverConfig } from "config/server";

@Component({
    selector: 'kEntryLive',
    templateUrl: './entry-live.component.html',
    styleUrls: ['./entry-live.component.scss']
})
export class EntryLive implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild('liveAnalytics') _liveAnalytics: PopupWidgetComponent;

  public _kmcPermissions = KMCPermissions;
	public _copyToClipboardTooltips: { success: string, failure: string, idle: string, notSupported: string } = null;
	public enableLiveAnalytics: boolean = false;


	constructor(public _widgetService: EntryLiveWidget, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
		this._copyToClipboardTooltips = {
			success: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.success'),
			failure: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.failure'),
			idle: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.idle'),
			notSupported: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.notSupported')
		};
    }


    ngOnInit() {
		this._widgetService.attachForm();
		this.enableLiveAnalytics = serverConfig.externalApps.liveAnalytics.enabled;
    }

    ngOnDestroy() {
		this._widgetService.detachForm();

	}


    ngAfterViewInit() {

    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }

	_regenerateToken():void{
		this._browserService.confirm(
			{
				header: this._appLocalization.get('applications.content.entryDetails.live.regeneratePromptHeader'),
				message: this._appLocalization.get('applications.content.entryDetails.live.regeneratePrompt'),
				accept: () => {
					this._widgetService.regenerateStreamToken();
				}
			}
		);
	}

	public _openLiveAnalytics(): void {
		if (this.enableLiveAnalytics){
		    // TODO - load live analytics app
			//this._liveAnalytics.open();
            this._browserService.alert(
                {
                    message: "Not implemented for Beta",
                }
            );
		}
	}


}

