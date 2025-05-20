import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';

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
import {ContentEntriesAppService} from '../../content-entries-app.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {KalturaMediaEntry} from 'kaltura-ngx-client';
import {MenuItem} from 'primeng/api';
import {Menu} from 'primeng/menu';
import {PubSubServiceType} from '@unisphere/runtime';

@Component({
    selector: 'kEntryQuizzes',
    templateUrl: './entry-quizzes.component.html',
    styleUrls: ['./entry-quizzes.component.scss'],
    providers: [
      KalturaLogger.createLogger('EntryQuizzesComponent')
    ]
})
export class EntryQuizzes implements OnInit, OnDestroy {
    @ViewChild('clipAndTrim', { static: true }) _clipAndTrim: PopupWidgetComponent;
    @ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;

    public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
    public _loading = false;
    public _loadingError = null;
    public _clipAndTrimEnabled = false;
    public _contentLabAvailable = false;

    private unisphereModuleContext: any;
    private unisphereCallbackUnsubscribe: Function;
    private sharedEntryId = '';
    public _selectedEntry: KalturaMediaEntry = null;
    public _actions: MenuItem[] = [];

    constructor(public _widgetService: EntryQuizzeWidget,
                private _bootstrapService: AppBootstrap,
                private _appPermissions: KMCPermissionsService,
                private _contentEntriesAppService: ContentEntriesAppService,
                private _appLocalization: AppLocalization,
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
                    }else {
                        this._clipAndTrimEnabled = false;
                    }
                }
            );

        this._appEvents
            .event(WindowClosedEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(({window}) => {
                if (window === 'editor') {
                    setTimeout(() => {
                        this.unisphereModuleContext?.openWidget(); // open widget
                    }, 100);

                }
            });

        this._actions = [
            {label: this._appLocalization.get('applications.content.table.editor'), command: (event) => {this.actionSelected("edit");}},
            {label: this._appLocalization.get('applications.content.table.pretest'), command: (event) => {this.actionSelected("download");}}
        ];
    }

    openActionsMenu(event: any, entry: KalturaMediaEntry): void{
        if (this.actionsMenu){
            // save the selected file for usage in the actions menu
            this._selectedEntry = entry;
            this.actionsMenu.toggle(event);
        }
    }

    private actionSelected(action: string): void{
        switch (action){
            case "edit":
                this._clipAndTrim.open();
                break;
            case "download":
                this.downloadQuestions(this._selectedEntry.id);
                break;
        }
    }

    public addQuiz(): void {
        if (this._clipAndTrimEnabled) {
            this._selectedEntry = this._widgetService.data;
            this._clipAndTrim.open();
        }
    }

    private downloadQuestions(entryId: string): void {
        this._contentEntriesAppService.downloadPretest(entryId)
            .pipe(
                tag('block-shell'),
                cancelOnDestroy(this)
            )
            .subscribe(
                (url) => {
                    this._browserService.openLink(url);
                },
                error => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message
                    });
                }
            );
    }

    ngOnDestroy() {
        if (this.unisphereCallbackUnsubscribe) {
            this.unisphereCallbackUnsubscribe();
        }
        this.actionsMenu.hide();
        this._widgetService.detachForm();
    }

    protected readonly _kmcPermissions = KMCPermissions;
}

