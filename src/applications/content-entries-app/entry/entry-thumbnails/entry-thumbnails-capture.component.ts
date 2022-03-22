import {Component, OnDestroy, Input, OnInit, AfterContentInit, ViewChild, ElementRef} from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import {serverConfig, getKalturaServerUri, buildCDNUrl} from 'config/server';
import {EmbedConfig, EmbedParams, PreviewEmbedService} from "../../../preview-and-embed/preview-and-embed.service";

@Component({
    selector: 'kThumbnailCapture',
    templateUrl: './entry-thumbnails-capture.component.html',
    styleUrls: ['./entry-thumbnails-capture.component.scss'],
    providers: [PreviewEmbedService]
})
export class EntryThumbnailCapture implements AfterContentInit, OnInit, OnDestroy{

	@Input() entryId: string;
	@Input() thumbnailUrl: string;
	@Input() parentPopupWidget: PopupWidgetComponent;
    @ViewChild('previewIframe') previewIframe: ElementRef;

    serverUri = getKalturaServerUri();
    playerConfig: any;
    renderPlayer = null;
    _showPlayer = true;
    public _generatedPreviewCode: string | EmbedParams = "";

    constructor(private _appAuthentication: AppAuthentication,
                private _previewEmbedService: PreviewEmbedService) {
    }

    ngOnInit() {
        this.renderPlayer = (e) => {
            if (!e.data) {
                return;
            }
            if (e.origin === window.location.origin && e.data.messageType === 'init') {
                this.previewIframe.nativeElement.contentWindow.postMessage({ 'messageType': 'embed', embedParams: this._generatedPreviewCode }, window.location.origin);
            }
            if (e.origin === window.location.origin && e.data.messageType === 'currentTime') {
                // pass current position
                const context = {
                	currentPosition: e.data.currentTime
                };
                this.parentPopupWidget.close(context);
            }
        }
    }

    ngAfterContentInit() {
        this._showPlayer = false; // remove iframe from DOM to invoke refresh
        setTimeout(() => {
            this._showPlayer = true;
            this.showPreview();
        }, 0);
    }

    private generateV3code(isPreview: boolean): string | EmbedParams {
        const uiConfId = serverConfig.kalturaServer.previewUIConfV7.toString();
        const embedType = 'dynamic';
        const ks = this._appAuthentication.appUser.ks;
        let embedConfig: EmbedConfig = {
            embedType,
            ks,
            entryId: this.entryId,
            uiConfId,
            width: 340,
            height: 210,
            pid: this._appAuthentication.appUser.partnerId,
            serverUri: buildCDNUrl(''),
            playerConfig: ''
        }
        let config = '';
        let poster = '';
        config = `{"ks": "${ks}"}`;
        // force thumbnail download using ks if needed
        if (this._appAuthentication.appUser.partnerInfo.loadThumbnailWithKs) {
            poster = `${this.thumbnailUrl}/width/340/ks/${this._appAuthentication.appUser.ks}`;
        }
        embedConfig.playerConfig = config;
        return this._previewEmbedService.generateV3EmbedCode(embedConfig, true, poster);
    }

    private showPreview(){
        setTimeout(() => { // use a timeout to allow the iframe to render before accessing its native element
            window.addEventListener('message', this.renderPlayer);
            const uri = serverConfig.externalApps.playerWrapper ? serverConfig.externalApps.playerWrapper.uri : '/public/playerWrapper.html';
            this.previewIframe.nativeElement.src = uri;
            this._generatedPreviewCode = this.generateV3code(true);
        }, 0);
    }

	_capture(){
        this.previewIframe.nativeElement.contentWindow.postMessage({ 'messageType': 'getCurrentTime' }, window.location.origin);
	}

    ngOnDestroy(): void {
        window.removeEventListener('message', this.renderPlayer);
    }

}

