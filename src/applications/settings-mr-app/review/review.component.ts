import {Component, OnInit, ViewChild} from '@angular/core';
import {SettingsMrMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {
    KalturaPager,
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
import {ReviewTagsComponent} from './review-tags/review-tags.component';
import {query} from '@angular/animations';

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
    @ViewChild('tags', { static: true }) private tags: ReviewTagsComponent;

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
    public _bulkActionsMenu: MenuItem[] = [];
    public _query: any = {};

    public _freeTextSearch = '';

    constructor(private _mrMainViewService: SettingsMrMainViewService,
                public _columnsResizeManager: ColumnsResizeManagerService,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _mrStore: MrStoreService) {
    }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            this._loadReviews(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
            this._bulkActionsMenu = [
                {
                    label: this._appLocalization.get('applications.settings.mr.approve'),
                    command: () => this._bulkAction('approve')
                },
                {
                    label: this._appLocalization.get('applications.settings.mr.deny'),
                    command: () => this._bulkAction('deny')
                },
                {
                    label: this._appLocalization.get('applications.settings.mr.perform'),
                    command: () => this._bulkAction('perform')
                },
                {
                    label: this._appLocalization.get('applications.settings.mr.notify'),
                    command: () => this._bulkAction('notify')
                }
            ];
        }
    }

    public _loadReviews(pageSize: number, pageIndex: number, sortField: string, sortOrder: number): void {
        this._blockerMessage = null;
        this._isBusy = true;
        this._reviews = [];
        const pager: KalturaPager = {
            pageIndex,
            pageSize
        }
        const orderBy = sortOrder === SortDirection.Desc ? `-${sortField}` : `${sortField}`;
        let filter = {pager, orderBy};
        filter = Object.assign(filter, this._query);
        this._mrStore.loadObjectStates(filter).subscribe(
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

    public clearSelection(): void {
        this._selectedReviews = [];
    }

    public _export(): void {
        console.log("export"); // TODO: implementation
    }

    public _bulkAction(action: string): void {
        console.log("preform bulk action: "+action); // TODO: implementation
    }

    public updateTags(customTooltip = ''): void {
        this.tags.updateTags(this._query, customTooltip);
    }

    public onAllTagsRemoved(): void {
        this._freeTextSearch = '';
        this._query = {};
        this._refresh();
    }

    public onTagRemoved(type: string): void {
        if (type === 'objectName') {
            this._freeTextSearch = '';
            delete this._query.objectName;
        }
        if (type === 'createdAt') {
            delete this._query.createdAtLessThanOrEqual;
            delete this._query.createdAtGreaterThanOrEqual;
        }
        if (type === 'actionAt') {
            delete this._query.plannedExecutionTimeLessThanOrEqual;
            delete this._query.plannedExecutionTimeGreaterThanOrEqual;
        }
        if (type === 'mediaType') {
            delete this._query.objectSubTypeIn;
        }
        if (type === 'duration') {
            delete this._query.objectDurationLessThan;
            delete this._query.objectDurationGreaterThan;
        }
        if (type === 'status') {
            delete this._query.statusIn;
        }
        if (type === 'rules') {
            delete this._query.managedTasksProfileIdIn;
        }
        if (type === 'owner') {
            delete this._query.ownerIdIn;
        }
        this._refresh();
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

    public _onFreetextChanged(): void {
        // prevent searching for empty strings
        if (this._freeTextSearch.length  === 0){
            delete this._query.objectName;
        }else {
            this._query.objectName = this._freeTextSearch;
        }
        this._refresh();
        this.updateTags();
    }

    public onFilterAdded(event: {filter: string, value: any, customTooltip?: string}) {
        this._query[event.filter] = event.value;
        this.updateTags(event.customTooltip || '');
        this._refresh();
    }

    public onFilterRemoved(filters: string[]) {
        let needRefresh = false;
        filters.forEach(filter => {
            if (typeof this._query[filter] !== "undefined") {
                delete this._query[filter];
                needRefresh = true;
            }
        })
        if (needRefresh) {
            this.updateTags();
            this._refresh();
        }
    }
}

