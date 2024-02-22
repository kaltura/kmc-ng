import {Component, OnInit, ViewChild} from '@angular/core';
import {SettingsMrMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {
    LoadManagedTasksProfilesResponse,
    LoadObjectStateResponse, ManagedTasksProfile,
    MrStoreService,
    ObjectState,
    SortDirection
} from '../mr-store/mr-store.service';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {ColumnsResizeManagerService, ResizableColumnsTableName} from 'app-shared/kmc-shared/columns-resize-manager';
import {Menu} from 'primeng/menu';
import {MenuItem} from 'primeng/api';

@Component({
    selector: 'kMrReview',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.scss'],
    providers: [KalturaLogger.createLogger('MrReviewComponent'),
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'review-table' }
    ]
})
export class ReviewComponent implements OnInit {
    @ViewChild('actionsmenu', { static: true }) private _actionsMenu: Menu;
    public _isBusy = false;
    public _reviews: ObjectState[] = [];
    public _selectedReviews: ObjectState[] = [];
    public _reviewsCount = 0;
    public _blockerMessage: AreaBlockerMessage = null;
    public pageSize = 25;
    public pageIndex = 0;
    public sortField = 'plannedExecutionTime';
    public sortOrder = SortDirection.Desc;
    public _rowTrackBy: Function = (index: number, item: any) => item.id;
    public _items: MenuItem[];

    constructor(private _mrMainViewService: SettingsMrMainViewService,
                public _columnsResizeManager: ColumnsResizeManagerService,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _mrStore: MrStoreService) {
    }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            this._loadReviews(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
        }
    }

    public _loadReviews(pageSize: number, pageIndex: number, sortField: string, sortOrder: number): void {
        this._blockerMessage = null;
        this._isBusy = true;
        this._mrStore.loadObjectStates(pageSize, pageIndex, sortField, sortOrder).subscribe(
            (response: LoadObjectStateResponse) => {
                if (response.objects?.length) {
                    this._reviews = response.objects as ObjectState[];
                    let profileIds = [];
                    this._reviews.forEach(review => { // mapping
                        review.plannedExecutionTime = new Date(review.plannedExecutionTime);
                        if (profileIds.indexOf(review.managedTasksProfileId) === -1) {
                            profileIds.push(review.managedTasksProfileId);
                        }
                    });
                    this._mrStore.loadProfiles(500,0,'createdAt', SortDirection.Desc, profileIds).subscribe(
                        (response: LoadManagedTasksProfilesResponse) => {
                            if (response.objects?.length) {
                                response.objects.forEach(profile => {
                                    this._reviews.forEach(review => {
                                        if (review.managedTasksProfileId === profile.id) {
                                            review.managedTasksProfileName = profile.name;
                                        }
                                    })
                                })
                            }
                            this._isBusy = false;
                        });

                } else {
                    this._isBusy = false;
                }
                this._reviewsCount = response.totalCount;
            },
            error => {
                this._isBusy = false;
                this._blockerMessage = new AreaBlockerMessage({
                    message: this._appLocalization.get('applications.settings.mr.rulesLoadError'),
                    buttons: [
                        {
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => {
                                this._logger.info(`user confirmed, retry action`);
                                this._blockerMessage = null;
                                this._refresh();
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
        )
    }

    private _actionSelected(action: string, review: ObjectState): void {
        console.log(action);
        switch (action) {
            case "approve":
                break;
            case "deny":
                break;
            case "preform":
                break;
        }
    }

    private _buildMenu(review: ObjectState): void {
        this._items = [
            {
                id: 'approve',
                label: this._appLocalization.get('applications.settings.mr.approve'),
                command: () => this._actionSelected('approve', review)
            },
            {
                id: 'deny',
                label: this._appLocalization.get('applications.settings.mr.deny'),
                command: () => this._actionSelected('deny', review)
            },
            {
                id: 'perform',
                label: this._appLocalization.get('applications.settings.mr.perform'),
                command: () => this._actionSelected('perform', review)
            }
        ];
    }


    public _refresh(): void {
        this._loadReviews(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
    }

    public _openActionsMenu(event: any, review: ObjectState): void {
        if (this._actionsMenu) {
            this._buildMenu(review);
            this._actionsMenu.toggle(event);
        }
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
}

