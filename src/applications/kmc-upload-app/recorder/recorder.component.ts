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
        // [av-diag] temporary instrumentation — remove once the root cause is identified.
        console.log('[av] context', {
            origin: location.origin,
            isSecureContext: window.isSecureContext,
            isTopLevel: window.self === window.top,
            hasMediaDevices: !!navigator.mediaDevices,
            hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
            userAgent: navigator.userAgent,
        });

        // Undefined in an insecure context — http:// on anything but localhost.
        if (!navigator.mediaDevices?.getUserMedia) return 'insecure';

        // [av-diag] Empty labels mean permission was never granted; a missing
        // videoinput/audioinput entry means there is no device to open at all.
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('[av] devices', devices.map(d => ({ kind: d.kind, label: d.label, deviceId: d.deviceId ? 'set' : 'empty' })));
        } catch (e) {
            console.log('[av] enumerateDevices threw', e);
        }

        // Read current state without prompting. Chrome supports both names;
        // other engines throw on them, so fall through to the request.
        const state = async (name: string): Promise<string> => {
            try {
                const result = (await navigator.permissions.query({ name: name as PermissionName })).state;
                console.log(`[av] permissions.query(${name}) =`, result);
                return result;
            } catch (e) {
                console.log(`[av] permissions.query(${name}) threw`, e);
                return 'prompt';
            }
        };

        const [cam, mic] = await Promise.all([state('camera'), state('microphone')]);
        if (cam === 'granted' && mic === 'granted') return 'granted';
        if (cam === 'denied' || mic === 'denied') {
            // [av-diag] Reached without ever calling getUserMedia, so no prompt is shown.
            console.log('[av] returning blocked from permissions.query', { cam, mic });
            return 'blocked';
        }

        console.log('[av] calling getUserMedia — a prompt should appear now', { cam, mic });
        const startedAt = performance.now();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            // Release immediately. The recorder acquires its own stream when it mounts;
            // holding these keeps the camera light on and can make that re-acquire fail.
            stream.getTracks().forEach((t) => t.stop());
            console.log('[av] getUserMedia resolved after', performance.now() - startedAt, 'ms');
            return 'granted';
        } catch (e) {
            // A prompt cannot have been shown and answered this fast, so an instant
            // rejection means the feature is blocked, not that the user refused.
            const elapsed = performance.now() - startedAt;
            // [av-diag] The error name is what actually distinguishes the causes:
            // NotAllowedError = block (site or OS), NotFoundError = no device,
            // NotReadableError/TrackStartError = device held by another app.
            console.log('[av] getUserMedia rejected', {
                name: (e as DOMException)?.name,
                message: (e as DOMException)?.message,
                elapsed,
                classifiedAs: elapsed < 100 ? 'blocked' : 'denied',
            });
            return elapsed < 100 ? 'blocked' : 'denied';
        }
    }

    async ngOnInit(): Promise<void> {
        const result = await this.ensureAvPermissions();
        console.log('AV permissions result', result);
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
