import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AppAuthentication, AppBootstrap} from 'app-shared/kmc-shell';
import { serverConfig } from "config/server";

@Component({
  selector: 'kRecorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
})
export class RecorderComponent implements OnInit, OnDestroy {

    @ViewChild('recorderFrame', { static: true}) recorderFrame: ElementRef;

    public appUrl: string;
    public _windowEventListener = null;
    private _recorderOrigin: string = null;

    constructor(private auth: AppAuthentication,
              private _bootstrapService: AppBootstrap) {
  }

    private sendMessageToRecorderApp(message: any): void{
        if (this.recorderFrame && this.recorderFrame.nativeElement.contentWindow && this.recorderFrame.nativeElement.contentWindow.postMessage) {
            this.recorderFrame.nativeElement.contentWindow.postMessage(message, this._recorderOrigin);
        }
    }

    private _addPostMessagesListener() {
        this._removePostMessagesListener();
        window.addEventListener('message', this._windowEventListener);
    }

    private _removePostMessagesListener(): void {
        window.removeEventListener('message', this._windowEventListener);
    }

    private getUnisphereEnv(url: string): string {
        const OVP_ENV_REGEX = /api\.([^./]+)\.ovp\.kaltura\.com/;
        const match = OVP_ENV_REGEX.exec(url);
        return match ? match[1] : 'nvp1';
    }


    ngOnInit(): void {

      const config = {
          ks: this.auth.appUser.ks,
          partnerId: this.auth.appUser.partnerId,
          serviceUrl: "https://" + serverConfig.kalturaServer.uri,
          playerUrl: "https://" + serverConfig.kalturaServer.uri,
          uiConfId: serverConfig.kalturaServer.previewUIConfV7
      }

      const env = this.getUnisphereEnv(config.serviceUrl);

      const recorderUrl = `http://localhost:4300/assets/loader/loader.html?parentOrigin=${encodeURIComponent(window.location.origin)}`;
      this._recorderOrigin = new URL(recorderUrl).origin;

        this._windowEventListener = (e) => {
            // only trust the recorder frame we created, on the origin we loaded it from
            if (e.origin !== this._recorderOrigin) {
                return;
            }
            if (!this.recorderFrame || e.source !== this.recorderFrame.nativeElement.contentWindow) {
                return;
            }

            let postMessageData;
            try {
                postMessageData = e.data;
            } catch (ex) {
                return;
            }

            if (postMessageData.messageType === 'recorderInit') {
                this.sendMessageToRecorderApp({'messageType': 'loadRecorder', payload: { config, env }});
            }
        };
        this._addPostMessagesListener();
        this.appUrl = recorderUrl;
    }

    ngOnDestroy(): void {
        this.appUrl = null;
        this._removePostMessagesListener();
    }

}
