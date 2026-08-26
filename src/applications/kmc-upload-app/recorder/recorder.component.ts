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

  private unisphereRuntime: any = null;
  private visuals: any = null;

  constructor(private auth: AppAuthentication,
              private _bootstrapService: AppBootstrap) {
  }


    async ensureAvPermissions(): Promise<string> {
        // Undefined in an insecure context — http:// on anything but localhost.
        if (!navigator.mediaDevices?.getUserMedia) return 'insecure';

        // Read current state without prompting. Chrome supports both names;
        // other engines throw on them, so fall through to the request.
        const state = async (name: string): Promise<string> => {
            try {
                return (await navigator.permissions.query({ name: name as PermissionName })).state;
            } catch {
                return 'prompt';
            }
        };

        const [cam, mic] = await Promise.all([state('camera'), state('microphone')]);
        if (cam === 'granted' && mic === 'granted') return 'granted';
        if (cam === 'denied' || mic === 'denied') return 'blocked';

        const startedAt = performance.now();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            // Release immediately. The recorder acquires its own stream when it mounts;
            // holding these keeps the camera light on and can make that re-acquire fail.
            stream.getTracks().forEach((t) => t.stop());
            return 'granted';
        } catch {
            // A prompt cannot have been shown and answered this fast, so an instant
            // rejection means the feature is blocked, not that the user refused.
            return performance.now() - startedAt < 100 ? 'blocked' : 'denied';
        }
    }

    async ngOnInit(): Promise<void> {
        const result = await this.ensureAvPermissions();
        if (result === 'granted') {
            this._bootstrapService.unisphereWorkspace$
                .pipe(cancelOnDestroy(this))
                .subscribe(unisphereWorkspace => {
                        if (unisphereWorkspace) {
                            unisphereWorkspace.loadRuntime('unisphere.widget.recorder', 'recorder', {
                                ks: this.auth.appUser.ks,
                                partnerId: this.auth.appUser.partnerId,
                                serviceUrl: "https://" + serverConfig.kalturaServer.uri,
                                playerUrl: "https://" + serverConfig.kalturaServer.uri,
                                uiConfId: serverConfig.kalturaServer.previewUIConfV7,
                                // mediapipeAssetBase: '/mediapipe',
                            }).then(({runtime}) => {
                                this.unisphereRuntime = runtime;
                                this.visuals = this.unisphereRuntime.mountVisual({
                                    type: 'contained',
                                    target: {type: 'element', elementId: 'recorder'},
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
    }

    ngOnDestroy(): void {
      if (this.unisphereRuntime && this.visuals) {
          this.unisphereRuntime.unmountVisual(this.visuals.id);
      }
    }

}
