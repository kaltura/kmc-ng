import {Component, OnDestroy, OnInit} from '@angular/core';

import {globalConfig} from 'config/global';
import {EntryClipsWidget} from './entry-clips-widget.service';
import {KalturaLogger} from "@kaltura-ng/kaltura-logger";
import { ClipAndTrimAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import { EntryStore } from '../entry-store.service';
import { combineLatest } from 'rxjs';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { serverConfig } from 'config/server';
import { AppAuthentication, AppBootstrap, BrowserService } from 'app-shared/kmc-shell';
import {PreviewAndEmbedEvent} from 'app-shared/kmc-shared/events';
import {AppEventsService} from 'app-shared/kmc-shared';
import {KalturaMediaEntry} from 'kaltura-ngx-client';
import {WindowClosedEvent} from 'app-shared/kmc-shared/events/window-closed.event';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';

@Component({
    selector: 'kEntryClips',
    templateUrl: './entry-clips.component.html',
    styleUrls: ['./entry-clips.component.scss'],
    providers: [
      KalturaLogger.createLogger('EntryClipsComponent')
    ]
})
export class EntryClips implements OnInit, OnDestroy {
    public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
    public _loading = false;
    public _loadingError = null;
    public _clipAndTrimEnabled = false;
    public _contentLabAvailable = false;

    private unisphereModuleContext: any;
    private unisphereCallbackUnsubscribe: Function;
    private sharedEntryId = '';

    constructor(public _widgetService: EntryClipsWidget,
                private _bootstrapService: AppBootstrap,
                private _appPermissions: KMCPermissionsService,
                private _appAuthentication: AppAuthentication,
                private _browserService: BrowserService,
                private _appEvents: AppEventsService,
                private _clipAndTrimAppViewService: ClipAndTrimAppViewService,
                logger: KalturaLogger,
                private _store: EntryStore) {
    }

    public _rowTrackBy(index: number, item: any): string {
        return item.id;
    }

    public _convertSortValue(value: boolean): number {
        return value ? 1 : -1;

    }

    public _onSortChanged(event: any) {
        if (event.field && event.order && (this._widgetService.sortOrder !== event.order || this._widgetService.sortBy !== event.field)) {
            this._widgetService.sortOrder = event.order;
            this._widgetService.sortBy = event.field;

            this._widgetService.updateClips();
        }
    }

    public _onPaginationChanged(state: any): void {
        if (state.page !== this._widgetService.pageIndex || state.rows !== this._widgetService.pageSize) {
            this._widgetService.pageIndex = state.page;
            this._widgetService.pageSize = state.rows;
            this._widgetService.updateClips();
        }
    }

    ngOnInit() {
        this._widgetService.attachForm();
        this._contentLabAvailable = this._appPermissions.hasPermission(KMCPermissions.FEATURE_CONTENT_LAB);
        combineLatest(
            this._widgetService.data$,
            this._store.hasSource.value$
        )
            .pipe(cancelOnDestroy(this))
            .subscribe(
                () => {
                    if (this._widgetService.data) {
                        this._clipAndTrimEnabled = this._clipAndTrimAppViewService.isAvailable({
                            entry: this._widgetService.data,
                            hasSource: this._store.hasSource.value()
                        });
                        if (this._widgetService.data?.id && this._contentLabAvailable) {
                            this.loadContentLab(this._widgetService.data.id);
                        }
                    }else {
                        this._clipAndTrimEnabled = false;
                    }
                }
            );

        this._appEvents
            .event(WindowClosedEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(({window}) => {
                if (window === 'preview') {
                    this.unisphereModuleContext?.selectClip(this.sharedEntryId); // set selected clip
                    setTimeout(() => {
                        this.unisphereModuleContext?.openWidget(); // open widget
                    }, 100);

                }
            });
    }

    private loadContentLab(entryId: string): void {
        this._bootstrapService.unisphereWorkspace$
            .pipe(cancelOnDestroy(this))
            .subscribe(unisphereWorkspace => {
                if (unisphereWorkspace) {
                    const contextSettings = {
                        ks: this._appAuthentication.appUser.ks,
                        pid: this._appAuthentication.appUser.partnerId.toString(),
                        uiconfId: serverConfig.kalturaServer.previewUIConfV7.toString(),
                        analyticsServerURI: serverConfig.analyticsServer.uri,
                        hostAppName: 'kmc',
                        hostAppVersion: globalConfig.client.appVersion,
                        kalturaServerURI: 'https://' + serverConfig.kalturaServer.uri,
                        kalturaServerProxyURI: '',
                        entryId,
                        buttonLabel: '',
                        eventSessionContextId: '',
                    }

                    if (!this.unisphereModuleContext) {
                        unisphereWorkspace.loadModuleContext('unisphere.module.content-lab', 'application', contextSettings).then((data: any) => {
                            this.unisphereModuleContext = data.moduleContext;
                            this.unisphereModuleContext.assignArea('contentLabButton');
                        }).catch(error => {
                            console.error('failed to load module: ' + error.message)
                        });
                    }

                    this.unisphereCallbackUnsubscribe = unisphereWorkspace.getService('unisphere.service.pub-sub')?.subscribe('unisphere.event.module.content-repurposing.message-host-app', (data) => {
                        const { action, entry } = data.payload;
                        switch (action) {
                            case 'entry':
                                // navigate to entry
                                document.body.style.overflowY = "auto";
                                this._widgetService.navigateToEntry(entry.id)
                                break;
                            case 'download':
                                // download entry
                                this._browserService.openLink(entry.downloadUrl);
                                break;
                            case 'share':
                                // edit entry
                                this.sharedEntryId = entry.id;
                                this.unisphereModuleContext?.closeWidget(); // close widget
                                this._appEvents.publish(new PreviewAndEmbedEvent(new KalturaMediaEntry(entry)));
                                break;
                            default:
                                break;
                        }
                    })
                }
            },
            error => {
                // TODO - handle unisphere workspace load error
            })
    }

    ngOnDestroy() {
        if (this.unisphereCallbackUnsubscribe) {
            this.unisphereCallbackUnsubscribe();
        }
        this._widgetService.detachForm();
    }
}

