import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppAuthentication, BrowserService } from 'shared/kmc-shell';
import { getKalturaServerUri, serverConfig, buildCDNUrl } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {
    ContentEntryViewSections,
    ContentEntryViewService,
    ReachAppViewService,
    ReachPages
} from 'app-shared/kmc-shared/kmc-views/details-views';
import { ClearEntriesSelectionEvent } from 'app-shared/kmc-shared/events/clear-entries-selection-event';
import { AppEventsService } from 'app-shared/kmc-shared/app-events';
import { KalturaCategory, KalturaMediaEntry } from 'kaltura-ngx-client';

export interface ReachData {
    entry?: KalturaMediaEntry;
    entries?: KalturaMediaEntry[];
    category?: KalturaCategory;
}

@Component({
    selector: 'kReachFrame',
    template: '<iframe frameborder="0" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ],
    providers: [KalturaLogger.createLogger('ReachFrameComponent')]
})
export class ReachFrameComponent implements OnInit, OnDestroy, OnChanges {
    @Input() page: ReachPages;
    @Input() data: ReachData = {};

    @Output() closeApp = new EventEmitter<void>();

    public _url = null;
    public _windowEventListener = null;
    public _reachConfig: any = null;

    constructor(private _appAuthentication: AppAuthentication,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService,
                private _contentEntryViewService: ContentEntryViewService,
                private _reachAppView: ReachAppViewService) {
    }

    ngOnInit(){
        this._windowEventListener = (e) => {
            let postMessageData;
            try {
                postMessageData = e.data;
            } catch (ex) {
                return;
            }

            if (postMessageData.messageType === 'reach-init') {
                e.source.postMessage({
                    'messageType': 'reach-config',
                    'data': this._reachConfig
                }, e.origin);
            };

            if (postMessageData.messageType === 'reach-dashboard-entry') {
                const entryId = postMessageData.data;
                this._logger.info(`handle 'dashboardEntryLinkAction' event from Reach app`, { entryId });
                if (entryId) {
                    this._logger.info(`open entry details view`);
                    this._contentEntryViewService.openById(entryId, ContentEntryViewSections.Metadata);
                } else {
                    this._logger.info(`entryId was not provided, abort action, close popup`);
                }
                this.closeApp.emit();
            };

            if (postMessageData.messageType === 'reach-bulk-order-cancelled') {
                this._logger.info(`handle 'bulkOrderOnCancel' event from Reach app, close floater, clear entries selection`);
                this._appEvents.publish(new ClearEntriesSelectionEvent());
                this.closeApp.emit();
            };

        };
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this._updateData();
        }
    }

    private _updateData(): void {
        setTimeout(() => {
            const { entries, entry, category } = this.data;
            const page = this.page;
            if (!this._reachAppView.isAvailable({ page, entries, entry, category })) {
                this._browserService.handleUnpermittedAction(true);
                this._url = null;
                this._reachConfig = null;
                this._removePostMessagesListener();
                return;
            }

            this._updateUrl();

            if (!this._url) {
                this._reachConfig = null;
                this._removePostMessagesListener();
                return;
            }

            this._reachConfig = {
                'ks': this._appAuthentication.appUser.ks,
                'service_url': getKalturaServerUri(),
                'partner_id': this._appAuthentication.appUser.partnerId,
                'cdn_host': buildCDNUrl(""),
                'language': this._appLocalization.selectedLanguage
            };

            if (this.page === ReachPages.entries) {
                this._reachConfig['entryIds'] = this.data.entries.map(({ id }) => id).join(',');
            }

            this._addPostMessagesListener();
        });
    }

    private _updateUrl(): void {
        this._url = null;

        switch (this.page) {
            case ReachPages.entry:
                if (this.data.entry) {
                    this._url = `${serverConfig.externalApps.reach.uri}#/entry/${this.data.entry.id}`;
                }
                break;
            case ReachPages.entries:
                if (Array.isArray(this.data.entries)) {
                    this._url = `${serverConfig.externalApps.reach.uri}#/entries`;
                }
                break;
            case ReachPages.category:
                if (this.data.category) {
                    this._url = `${serverConfig.externalApps.reach.uri}#/category/${this.data.category.id}`;
                }
                break;
            case ReachPages.dashboard:
                this._url = `${serverConfig.externalApps.reach.uri}#/dashboard`;
                break;
            default:
                break;
        }
    }

    private _addPostMessagesListener() {
        this._removePostMessagesListener();
        window.addEventListener('message', this._windowEventListener);
    }

    private _removePostMessagesListener(): void {
        window.removeEventListener('message', this._windowEventListener);
    }

    ngOnDestroy() {
        this._url = null;
        this._removePostMessagesListener();
    }
}
