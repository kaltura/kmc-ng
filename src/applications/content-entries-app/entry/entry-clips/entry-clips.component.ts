import {Component, OnDestroy, OnInit} from '@angular/core';

import {globalConfig} from 'config/global';
import {EntryClipsWidget} from './entry-clips-widget.service';
import {KalturaLogger} from "@kaltura-ng/kaltura-logger";
import { ClipAndTrimAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import { EntryStore } from '../entry-store.service';
import { merge } from 'rxjs';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { serverConfig } from 'config/server';
import { AppAuthentication, AppBootstrap, BrowserService } from 'app-shared/kmc-shell';

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
    public _clipAndTrimDisabledReason: string = null;

    private unisphereInfoUnsubscribe: Function;
    private unisphereCallbackUnsubscribe: Function;

    constructor(public _widgetService: EntryClipsWidget,
                private _bootstrapService: AppBootstrap,
                private _appAuthentication: AppAuthentication,
                private _browserService: BrowserService,
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

        merge(
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
                        if (this._widgetService.data?.id) {
                            this.loadContentLab(this._widgetService.data.id);
                        }
                    }else {
                        this._clipAndTrimEnabled = false;
                    }
                }
            );
    }

    private loadContentLab(entryId: string): void {
        this._bootstrapService.unisphereWorkspace$.pipe(cancelOnDestroy(this)).subscribe(unisphereWorkspace => {
                if (unisphereWorkspace) {
                    unisphereWorkspace.getService('unisphere.service.pub-sub')?.emit({
                        type: 'unisphere.event.workspace.load-module',
                        version: '1.0.0',
                        payload: {
                            id: 'unisphere.module.content-repurposing',
                            context: 'application',
                            settings: {
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
                        }
                    })

                    this.unisphereInfoUnsubscribe = unisphereWorkspace.getService('unisphere.service.pub-sub')?.subscribe('unisphere.event.workspace.module-info-updated', (data) => {
                        if (data.type === 'unisphere.event.workspace.module-info-updated') {
                            const isModuleContextLoaded = data.payload?.name === 'unisphere.module.content-repurposing' && data.payload?.status === 'loaded';
                            if (!isModuleContextLoaded) {
                                return;
                            }
                            console?.log(' module loaded, assigning area.');
                            const moduleContext = unisphereWorkspace.getModule('unisphere.module.content-repurposing', 'application');
                            if (moduleContext) {
                                moduleContext.assignArea('contentLabButton')
                            }
                        }
                    })

                    this.unisphereCallbackUnsubscribe = unisphereWorkspace.getService('unisphere.service.pub-sub')?.subscribe('unisphere.event.module.content-repurposing.message-host-app', (data) => {
                        const { action, entry } = data.payload;
                        switch (action) {
                            case 'entry':
                                // navigate to entry
                                this._widgetService.navigateToEntry(entry.id)
                                break;
                            case 'download':
                                // download entry
                                this._browserService.openLink(entry.downloadUrl);
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
        if (this.unisphereInfoUnsubscribe) {
            this.unisphereInfoUnsubscribe();
        }
        if (this.unisphereCallbackUnsubscribe) {
            this.unisphereCallbackUnsubscribe();
        }
        this._widgetService.detachForm();
    }
}

