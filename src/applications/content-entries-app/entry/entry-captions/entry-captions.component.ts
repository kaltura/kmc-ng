import {AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';

import { Menu } from 'primeng/menu';
import { ISubscription } from 'rxjs/Subscription';

import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import {KalturaCaptionAssetStatus, KalturaCaptionAssetUsage, KalturaCaptionType, KalturaMediaType} from 'kaltura-ngx-client';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { EntryCaptionsWidget } from './entry-captions-widget.service';
import { getKalturaServerUri, serverConfig } from 'config/server';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { ReachAppViewService, ReachPages } from 'app-shared/kmc-shared/kmc-views/details-views';
import { MenuItem } from 'primeng/api';
import { AppEventsService } from "app-shared/kmc-shared";
import { CaptionsUpdatedEvent } from "app-shared/kmc-shared/events";


@Component({
    selector: 'kEntryCaptions',
    templateUrl: './entry-captions.component.html',
    styleUrls: ['./entry-captions.component.scss']
})
export class EntryCaptions implements AfterViewInit, OnInit, OnDestroy {
    public _kmcPermissions = KMCPermissions;

    public _actions: MenuItem[] = [];
    public actions: MenuItem[] = [];
    public _captionStatusReady = KalturaCaptionAssetStatus.ready;
    public _captionStatusError = KalturaCaptionAssetStatus.error;
    public _requestCaptionsAvailable = false;
    public _isLive = false;
    public _ead = false;

    @ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;
    @ViewChild('editPopup', { static: true }) public editPopup: PopupWidgetComponent;

    private _popupStateChangeSubscribe: ISubscription;
    constructor(public _widgetService: EntryCaptionsWidget,
                private _appAuthentication: AppAuthentication,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _appEvents: AppEventsService,
                private _ngZone: NgZone,
                private _reachAppViewService: ReachAppViewService) {
    }

    ngOnInit() {
        this._widgetService.attachForm();

        this._actions = [
            {id: 'edit', label: this._appLocalization.get('applications.content.entryDetails.captions.edit'), command: (event) => {this.actionSelected("edit");}},
            {id: 'editor', label: this._appLocalization.get('applications.content.entryDetails.captions.editor'), command: (event) => {this.actionSelected("editor");}},
            {id: 'download', label: this._appLocalization.get('applications.content.entryDetails.captions.download'), command: (event) => {this.actionSelected("download");}},
            {id: 'preview', label: this._appLocalization.get('applications.content.entryDetails.captions.preview'), command: (event) => {this.actionSelected("preview");}},
            {id: 'delete', label: this._appLocalization.get('applications.content.entryDetails.captions.delete'), styleClass: 'kDanger', command: (event) => {this.actionSelected("delete");}}
        ];

        this._widgetService.data$
            .pipe(cancelOnDestroy(this))
            .subscribe(entry => {
                this._requestCaptionsAvailable = this._reachAppViewService.isAvailable({ page: ReachPages.entry, entry });
                this._isLive = entry && this._isLiveMediaEntry(entry.mediaType);
            });

        this._appEvents.event(CaptionsUpdatedEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(() => {
                // update the captions table once the captions editor / captions & enrich window closes
                this._widgetService.reloadCaptions().subscribe(
                    (status) => {}
                );
            });
    }

    openActionsMenu(event: any, caption: any): void{
        if (!this._requestCaptionsAvailable && this._actions[1].id === 'editor') {
            this._actions.splice(1,1);
        }
        if (this._requestCaptionsAvailable && this._actions[1].id === 'editor') {
            if (caption.format !== KalturaCaptionType.srt && caption.format !== KalturaCaptionType.dfxp && caption.format !== KalturaCaptionType.webvtt) {
                this._actions[1].disabled = true;
                this._actions[1].title = this._appLocalization.get('applications.content.entryDetails.captions.editorDisabled');
            } else {
                this._actions[1].disabled = false;
                this._actions[1].title = null;
            }
        }
        if (this.actionsMenu){
            // save the selected caption for usage in the actions menu
            this._widgetService.currentCaption = caption;
            this._ead = caption.usage === KalturaCaptionAssetUsage.extendedAudioDescription;
            this.actions = this.filterActions();
            this.actionsMenu.toggle(event);
        }
    }

    private _isLiveMediaEntry(mediaType: KalturaMediaType): boolean {
        return mediaType === KalturaMediaType.liveStreamFlash ||
            mediaType === KalturaMediaType.liveStreamWindowsMedia ||
            mediaType === KalturaMediaType.liveStreamRealMedia ||
            mediaType === KalturaMediaType.liveStreamQuicktime;
    }

    private filterActions() {
        if (this._widgetService.currentCaption?.status === KalturaCaptionAssetStatus.error) {
            return this._actions.filter(action => action.id === 'delete');
        } else {
            return this._actions;
        }
    }

    ngAfterViewInit(){
        if (this.editPopup) {
            this._popupStateChangeSubscribe = this.editPopup.state$
                .subscribe(event => {
                    if (event.state === PopupWidgetStates.Close) {
                        if (event.context && event.context.newCaptionFile){
                            this._widgetService.upload(event.context.newCaptionFile);
                        }
                        if (event.context && event.context.newCaptionUrl){
                            this._widgetService.currentCaption.uploadUrl = event.context.newCaptionUrl;
                        }
                        if (event.context){
                            this._widgetService.setDirty();
                        }
                        this._widgetService.removeEmptyCaptions(); // cleanup of captions that don't have assets (url or uploaded file)
                    }
                });
        }
    }

    public _addCaption(ead: boolean){
        this._ead = ead;
        this._widgetService._addCaption(ead);
        setTimeout( () => {this.editPopup.open(); }, 0); // use a timeout to allow data binding of the new caption to update before opening the popup widget
    }

    private actionSelected(action: string): void{
        switch (action){
            case "edit":
                this.editPopup.open();
                break;
            case "editor":
                this.editCaption();
                break;
            case "delete":
                this._widgetService.removeCaption();
                break;
            case "download":
                this._downloadFile();
                break;
            case "preview":
                this._widgetService.getCaptionPreviewUrl()
                    .subscribe(({ url }) =>
                    {
                        this._browserService.openLink(url);
                    })

                break;
        }
    }

    private _downloadFile(): void {
        if (this._browserService.isIE11()) { // IE11 - use download API
            const baseUrl = serverConfig.cdnServers.serverUri;
            const protocol = 'http';
            const partnerId = this._appAuthentication.appUser.partnerId;
            const entryId = this._widgetService.data.id;
            let url = baseUrl + '/p/' + partnerId +'/sp/' + partnerId + '00/playManifest/entryId/' + entryId + '/flavorId/' + this._widgetService.currentCaption.id + '/format/download/protocol/' + protocol;
            this._browserService.openLink(url);
        }else {
            const url = getKalturaServerUri("/api_v3/service/caption_captionasset/action/serve/ks/" + this._appAuthentication.appUser.ks + "/captionAssetId/" + this._widgetService.currentCaption.id);

            this._browserService.download(url, this._widgetService.currentCaption.id + "." + this._widgetService.currentCaption.fileExt, this._widgetService.currentCaption.fileExt);
        }
    }

    ngOnDestroy() {
        this.actionsMenu.hide();
        this._popupStateChangeSubscribe.unsubscribe();

        this._widgetService.detachForm();
        // clear message bus
        window['kmcCaptions'] = null;
    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }

    private editCaption(): void {
        const entry = this._widgetService.data;
        const captionId = this._widgetService.currentCaption.id;
        this._reachAppViewService.open({ entry, page: ReachPages.caption, captionId });
    }

    public _requestCaptions(): void {
        const entry = this._widgetService.data;
        this._reachAppViewService.open({ entry, page: ReachPages.entry });
    }
}

