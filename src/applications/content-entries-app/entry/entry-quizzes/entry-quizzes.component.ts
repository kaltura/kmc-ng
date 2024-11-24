import {Component, OnDestroy, OnInit} from '@angular/core';

import {globalConfig} from 'config/global';
import {EntryQuizzeWidget} from './entry-quizzes-widget.service';
import {KalturaLogger} from "@kaltura-ng/kaltura-logger";
import { ClipAndTrimAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import { EntryStore } from '../entry-store.service';
import { combineLatest } from 'rxjs';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { serverConfig } from 'config/server';
import { AppAuthentication, AppBootstrap, BrowserService } from 'app-shared/kmc-shell';
import {AppEventsService} from 'app-shared/kmc-shared';
import {WindowClosedEvent} from 'app-shared/kmc-shared/events/window-closed.event';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';

@Component({
    selector: 'kEntryQuizzes',
    templateUrl: './entry-quizzes.component.html',
    styleUrls: ['./entry-quizzes.component.scss'],
    providers: [
      KalturaLogger.createLogger('EntryQuizzesComponent')
    ]
})
export class EntryQuizzes implements OnInit, OnDestroy {
    public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
    public _loading = false;
    public _loadingError = null;
    public _clipAndTrimEnabled = false;
    public _contentLabAvailable = false;

    private unisphereModuleContext: any;
    private unisphereCallbackUnsubscribe: Function;
    private sharedEntryId = '';

    constructor(public _widgetService: EntryQuizzeWidget,
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

            this._widgetService.updateQuizzes();
        }
    }

    public _onPaginationChanged(state: any): void {
        if (state.page !== this._widgetService.pageIndex || state.rows !== this._widgetService.pageSize) {
            this._widgetService.pageIndex = state.page;
            this._widgetService.pageSize = state.rows;
            this._widgetService.updateQuizzes();
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
                    this.unisphereModuleContext?.selectClip(this.sharedEntryId); // set selected quiz
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
                        widget: 'quiz',
                        entryId,
                        buttonLabel: '',
                        eventSessionContextId: '',
                    }

                    if (this._widgetService.isLiveEntry() && this._widgetService.data?.redirectEntryId?.length) {
                        // handle live with recording
                        contextSettings.entryId = this._widgetService.data.redirectEntryId;
                        contextSettings.eventSessionContextId = entryId;
                    }

                    if (!this.unisphereModuleContext) {
                        unisphereWorkspace.loadElement('unisphere.module.content-lab', 'application', contextSettings).then((data: any) => {
                            this.unisphereModuleContext = data.element;
                            this.unisphereModuleContext.assignArea('contentLabButton');
                        }).catch(error => {
                            console.error('failed to load module: ' + error.message)
                        });
                    }

                    this.unisphereCallbackUnsubscribe = unisphereWorkspace.getService('unisphere.service.pub-sub')?.subscribe('unisphere.event.module.content-lab.message-host-app', (data) => {
                        const { action, entry } = data.payload;
                        switch (action) {
                            case 'entry':
                                // navigate to entry
                                document.body.style.overflowY = "auto";
                                this._widgetService.navigateToEntry(entry.id)
                                this.unisphereModuleContext?.closeWidget();
                                break;
                            case 'download':
                                // download questions list
                                alert("download questions list")
                                break;
                            case 'edit':
                                // edit entry
                                alert("edit quiz")
                                // this.sharedEntryId = entry.id;
                                // this.unisphereModuleContext?.closeWidget(); // close widget
                                // this._appEvents.publish(new PreviewAndEmbedEvent(new KalturaMediaEntry(entry)));
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

