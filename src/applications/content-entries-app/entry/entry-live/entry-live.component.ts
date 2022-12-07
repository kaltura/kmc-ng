import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAnalytics, BrowserService } from 'app-shared/kmc-shell/providers';

import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { EntryLiveWidget } from './entry-live-widget.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

import { LiveAnalyticsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { KalturaLiveStreamEntry, KalturaSipSourceType } from 'kaltura-ngx-client';
import { EntryStore } from "../entry-store.service";
import {serverConfig} from "config/server";

@Component({
    selector: 'kEntryLive',
    templateUrl: './entry-live.component.html',
    styleUrls: ['./entry-live.component.scss']
})
export class EntryLive implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild('liveAnalytics', { static: true }) _liveAnalytics: PopupWidgetComponent;
	@ViewChild('lowLatencyHelp', { static: true }) _lowLatencyHelp: PopupWidgetComponent;

  public _kmcPermissions = KMCPermissions;
	public _copyToClipboardTooltips: { success: string, failure: string, idle: string, notSupported: string } = null;
	public enableLiveAnalytics: boolean = false;
    public _sipSources = [
        {value: KalturaSipSourceType.talkingHeads, label: this._appLocalization.get('applications.content.entryDetails.live.sipSource1')},
        {value: KalturaSipSourceType.pictureInPicture, label: this._appLocalization.get('applications.content.entryDetails.live.sipSource2')},
        {value: KalturaSipSourceType.screenShare, label: this._appLocalization.get('applications.content.entryDetails.live.sipSource3')}
    ];
    public _srtPassOptions = [
        {value: 'auto', label: this._appLocalization.get('applications.content.entryDetails.live.srtPassAuto')},
        {value: 'manual', label: this._appLocalization.get('applications.content.entryDetails.live.srtPassManual')}
    ];
    public _selectedSipSource = null;
    public _selectedSrtPassMode = 'auto';
    public _generatingSipToken = false;
    public _sipTokenError = false;

	constructor(
	    public _widgetService: EntryLiveWidget,
        private _entryStore: EntryStore,
        private _appLocalization: AppLocalization,
        private _analytics: AppAnalytics,
        private _browserService: BrowserService,
        private _liveAnalyticsView: LiveAnalyticsMainViewService
    ) {
		this._copyToClipboardTooltips = {
			success: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.success'),
			failure: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.failure'),
			idle: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.idle'),
			notSupported: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.notSupported')
		};
    }


    ngOnInit() {
		this._widgetService.attachForm();
		this.enableLiveAnalytics = this._liveAnalyticsView.isAvailable();
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
        if (this.enableLiveAnalytics) {
            this._liveAnalytics.open();
        }
    }
    public openLoaLatencyHelp(): void {
        this._lowLatencyHelp.open();
        this._lowLatencyHelp.popup.nativeElement.style.opacity = 1;
    }

    public _generateSip(): void {
        if (this._selectedSipSource) {
            this._analytics.trackClickEvent('Generate_SIP_user');
            this._generatingSipToken = true;
            this._sipTokenError = false;
            const regenerate = (this._widgetService.data as KalturaLiveStreamEntry).sipToken ? true : false;
            this._widgetService.generateSipToken(this._selectedSipSource, regenerate).subscribe(
                result => {
                    this._generatingSipToken = false;
                    this._entryStore.reloadEntry();
                },
                error => {
                    this._generatingSipToken = false;
                    this._sipTokenError = true;
                });
        }
    }

    public openLowLatencyLink(): void {
        this._browserService.openLink(serverConfig.externalLinks.live.lowLatency);
        this._lowLatencyHelp.close();
    }
}

