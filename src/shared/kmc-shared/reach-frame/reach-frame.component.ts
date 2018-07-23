import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { AppAuthentication, BrowserService } from 'shared/kmc-shell';
import { getKalturaServerUri, serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { ReachAppViewService, ReachPages } from 'app-shared/kmc-shared/kmc-views/component-views';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
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
    template: '<iframe frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ],
    providers: [KalturaLogger.createLogger('ReachFrameComponent')]
})
export class ReachFrameComponent implements OnDestroy, OnChanges {
    @Input() page: ReachPages;
    @Input() data: ReachData = {};

    @Output() closeApp = new EventEmitter<void>();

    public _url = null;

    constructor(private _appAuthentication: AppAuthentication,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService,
                private _contentEntryViewService: ContentEntryViewService,
                private _reachAppView: ReachAppViewService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this._updateData();
        }
    }

    private _updateData(): void {
        try {
            const { entries, entry, category } = this.data;
            const page = this.page;
            if (!this._reachAppView.isAvailable({ page, entries, entry, category })) {
                this._browserService.handleUnpermittedAction(true);
                return;
            }

            this._updateUrl();

            if (this._url) {
                window['kmc'] = {
                    'vars': {
                        'ks': this._appAuthentication.appUser.ks,
                        'service_url': getKalturaServerUri(),
                        'reach': {
                            language: this._appLocalization.selectedLanguage,
                            dashboardEntryLinkAction: (entryId) => {
                                this._logger.info(`handle 'dashboardEntryLinkAction' event from Reach app, open entry details vide`, { entryId });
                                this._contentEntryViewService.openById(entryId, ContentEntryViewSections.Metadata);
                            },
                            bulkOrderOnCancel: () => {
                                this._logger.info(`handle 'bulkOrderOnCancel' event from Reach app, close floater, clear entries selection`);
                                this._appEvents.publish(new ClearEntriesSelectionEvent());
                                this.closeApp.emit();
                            }
                        }
                    }
                };

                if (this.page === ReachPages.entries) {
                    window['kmc']['vars']['reach']['entryIds'] = this.data.entries.map(({ id }) => id).join(',');
                }
            }
        } catch (ex) {
            this._logger.warn(`Could not load reach app, please check that reach configurations are loaded correctly\n error: ${ex}`);
            this._url = null;
            window['kmc'] = null;
        }
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
                if (this.data.entries) {
                    this._url = `${serverConfig.externalApps.reach.uri}#/entries`;
                }
                break;
            case ReachPages.category:
                if (this.data.category) {
                    this._url = `${serverConfig.externalApps.reach.uri}#/category/${this.data.category.id}`;
                }
                break;
            default:
                break;
        }
    }

    ngOnDestroy() {
        this._url = null;
        window['kmc'] = null;
    }
}
