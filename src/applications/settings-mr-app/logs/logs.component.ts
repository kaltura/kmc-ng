import {Component, OnInit} from '@angular/core';
import {SettingsMrMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {
    KalturaPager,
    LoadManagedTasksProfilesResponse,
    LoadObjectStateResponse, LoadReportsResponse, MrStoreService,
    ObjectState, Report,
    SortDirection
} from '../mr-store/mr-store.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {ColumnsResizeManagerService, ResizableColumnsTableName} from 'app-shared/kmc-shared/columns-resize-manager';

@Component({
    selector: 'kMrLogs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss'],
    providers: [KalturaLogger.createLogger('MrReportsComponent'),
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'reports-table' }
    ]
})
export class LogsComponent implements OnInit {

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;

    public pageSize = 25;
    public pageIndex = 0;
    public sortField = 'requestedDate';
    public sortOrder = SortDirection.Desc;
    public _query: any = {};

    public _reports: Report[] = [];
    public _reportsCount = 0;
    public _rowTrackBy: Function = (index: number, item: any) => item.id;

    constructor(private _mrMainViewService: SettingsMrMainViewService,
                public _columnsResizeManager: ColumnsResizeManagerService,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _mrStore: MrStoreService) {
    }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            this._loadReports(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
        }
    }

    private displayError(message: string, retryAction?: Function): void {
        this._isBusy = false;
        this._blockerMessage = new AreaBlockerMessage({
            message,
            buttons: [
                {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                        this._logger.info(`user confirmed, retry action`);
                        this._blockerMessage = null;
                        retryAction();
                    }
                },
                {
                    label: this._appLocalization.get('app.common.cancel'),
                    action: () => {
                        this._logger.info(`user didn't confirm, abort action, dismiss dialog`);
                        this._blockerMessage = null;
                    }
                }
            ]
        });
    }

    public _loadReports(pageSize: number, pageIndex: number, sortField: string, sortOrder: number): void {
        this._blockerMessage = null;
        this._isBusy = true;
        this._reports = [];
        const pager: KalturaPager = {
            pageIndex,
            pageSize
        }
        const orderBy = sortOrder === SortDirection.Desc ? `-${sortField}` : `${sortField}`;
        let filter = { pager, orderBy, statusIn: ["ready"] };
        filter = Object.assign(filter, this._query);
        this._mrStore.loadReports(filter).subscribe(
            (response: LoadReportsResponse) => {
                if (response.objects?.length) {
                    this._reports = response.objects as Report[];
                    let profileIds = [];
                    this._reports.forEach(report => { // mapping
                        report.requestedDate = new Date(report.requestedDate);
                        if (profileIds.indexOf(report.managedTasksProfileId) === -1) {
                            profileIds.push(report.managedTasksProfileId);
                        }
                    });
                    this._mrStore.loadProfiles(500,0,'createdAt', SortDirection.Desc, profileIds).subscribe(
                        (response: LoadManagedTasksProfilesResponse) => {
                            if (response.objects?.length) {
                                response.objects.forEach(profile => {
                                    this._reports.forEach(report => {
                                        if (report.managedTasksProfileId === profile.id) {
                                            report.managedTasksProfileName = profile.name;
                                        }
                                    })
                                })
                            }
                            this._isBusy = false;
                        });

                } else {
                    this._isBusy = false;
                }
                this._reportsCount = response.totalCount;
            },
            error => {
                this.displayError(this._appLocalization.get('applications.settings.mr.reportsLoadError'), () => this._refresh());
            }
        )
    }

    public _onPaginationChanged(state: any): void {
        if (state.page !== this.pageIndex || state.rows !== this.pageSize) {
            this.pageSize = state.rows;
            this.pageIndex = state.page;
            this._refresh();
        }
    }

    public onSortChanged(event): void {
        if (event.field !== this.sortField || event.order !== this.sortOrder) {
            this.sortField = event.field;
            this.sortOrder = event.order;
            this._refresh();
        }
    }

    public getType(type: 'watchProfileResults' | 'profileDryRun' | 'executionSummary'): string {
        switch (type) {
            case 'watchProfileResults':
                return this._appLocalization.get('applications.settings.mr.report.scan');
                break;
            case 'profileDryRun':
                return this._appLocalization.get('applications.settings.mr.report.test');
                break;
            case 'executionSummary':
                return this._appLocalization.get('applications.settings.mr.report.action');
                break;
        }
    }

    public download(id: string): void {
        this._isBusy = true;
        this._mrStore.downloadReport(id).subscribe(
            success => {
                this._isBusy = false;
            },
            error => {
                this.displayError(this._appLocalization.get('applications.settings.mr.reportDownloadError'), () => this.download(id));
            }
        );
    }

    public _refresh(): void {
        this._loadReports(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
    }
}

