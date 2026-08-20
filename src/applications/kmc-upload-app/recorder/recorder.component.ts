import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AppAuthentication, AppBootstrap} from 'app-shared/kmc-shell';
import { serverConfig } from "config/server";

@Component({
  selector: 'kRecorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
})
export class RecorderComponent implements OnInit, OnDestroy {

  @ViewChild('recorder', { static: true }) recorder: HTMLDivElement;
  private unisphereRuntime: any = null;
  private visuals: any = null;

  constructor(private auth: AppAuthentication,
              private _bootstrapService: AppBootstrap) {
  }

    ngOnInit(): void {
        this._bootstrapService.unisphereWorkspace$
            .pipe(cancelOnDestroy(this))
            .subscribe(unisphereWorkspace => {
                    if (unisphereWorkspace) {
                        unisphereWorkspace.loadRuntime('unisphere.widget.recorder', 'recorder', {
                            ks: this.auth.appUser.ks,
                            partnerId: this.auth.appUser.partnerId,
                            serviceUrl: "https://" + serverConfig.kalturaServer.uri,
                            playerUrl: "https://" + serverConfig.kalturaServer.uri,
                            uiConfId: serverConfig.kalturaServer.previewUIConfV7
                        }).then(({runtime, runtimeInfo}) => {
                            this.unisphereRuntime = runtime;
                            this.visuals = this.unisphereRuntime.mountVisual({
                                type: 'contained',
                                target: { type: 'element', elementId: 'recorder' },
                                settings: {}
                            });
                        }).catch(error => {
                            console.error('Failed to load recorder runtime', error)
                        });
                    }
                },
                error => {
                    console.error('Error initializing Unisphere workspace', error);
                })
    }

    ngOnDestroy(): void {
      if (this.unisphereRuntime && this.visuals) {
          this.unisphereRuntime.unmountVisual(this.visuals.id);
      }
    }

}
