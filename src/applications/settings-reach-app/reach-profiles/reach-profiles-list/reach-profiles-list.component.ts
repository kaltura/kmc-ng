import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AreaBlockerMessage, StickyComponent} from '@kaltura-ng/kaltura-ui';
import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {BrowserService} from 'app-shared/kmc-shell/providers';
import {SettingsReachMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {
    KalturaReachProfileWithCredit,
    ReachProfilesFilters,
    ReachProfilesStore
} from "../reach-profiles-store/reach-profiles-store.service";
import {KalturaReachProfile} from "kaltura-ngx-client";
import {SortDirection} from "../../../administration-multi-account-app/multi-account-store/multi-account-store.service";
import {
    SettingsReachProfileViewSections,
    SettingsReachProfileViewService
} from "app-shared/kmc-shared/kmc-views/details-views/settings-reach-profile-view.service";

@Component({
    selector: 'k-reach-profiles-list',
    templateUrl: './reach-profiles-list.component.html',
    styleUrls: ['./reach-profiles-list.component.scss'],
    providers: [KalturaLogger.createLogger('ReachProfilesListComponent')]
})
export class ReachProfilesListComponent implements OnInit, OnDestroy {
    
    @Output() setParentBlockerMessage = new EventEmitter<AreaBlockerMessage>();
    
    public _tableIsBusy = false;
    public _tableBlockerMessage: AreaBlockerMessage;
    public _kmcPermissions = KMCPermissions;
    
    public _query = {
        freeText: '',
        sortBy: 'createdAt',
        sortDirection: SortDirection.Asc,
        pageIndex: 0,
        pageSize: 50
    };
    
    constructor(private _appLocalization: AppLocalization,
                private _router: Router,
                private _logger: KalturaLogger,
                private _browserService: BrowserService,
                private _settingsReachMainViewService: SettingsReachMainViewService,
                private _settingsReachViewService: SettingsReachProfileViewService,
                public _reachProfilesStore: ReachProfilesStore) {
    }
    
    ngOnInit() {
        if (this._settingsReachMainViewService.isAvailable()) {
            this._prepare();
        }
    }
    
    ngOnDestroy() {
    
    }
    
    private _prepare(): void {
        this._logger.info(`initialize reach profiles list view`);
        this._restoreFiltersState();
        this._registerToFilterStoreDataChanges();
        this._registerToDataChanges();
    }
    
    private _registerToFilterStoreDataChanges(): void {
        this._reachProfilesStore.filtersChange$
            .pipe(cancelOnDestroy(this))
            .subscribe(({changes}) => {
                this._updateComponentState(changes);
            });
    }
    
    private _registerToDataChanges(): void {
        this._reachProfilesStore.profiles.state$
            .pipe(cancelOnDestroy(this))
            .subscribe(
                result => {
                    setTimeout(() => {
                        this._tableIsBusy = result.loading;
                    }, 0);
                    if (result.errorMessage) {
                        this._logger.info(`handle failing load profiles list data, show confirmation`);
                        this._tableBlockerMessage = new AreaBlockerMessage({
                            message: result.errorMessage || this._appLocalization.get('applications.settings.reach.errorLoadingProfiles'),
                            buttons: [
                                {
                                    label: this._appLocalization.get('app.common.retry'),
                                    action: () => {
                                        this._logger.info(`user selected retry, reload profiles list data`);
                                        this._tableBlockerMessage = null;
                                        this._reachProfilesStore.reload();
                                    }
                                },
                                {
                                    label: this._appLocalization.get('app.common.cancel'),
                                    action: () => {
                                        this._logger.info(`user canceled, dismiss confirmation`);
                                        this._tableBlockerMessage = null;
                                    }
                                }
                            ]
                        });
                    } else {
                        this._tableBlockerMessage = null;
                    }
                }
            );
    }
    
    private _restoreFiltersState(): void {
        this._updateComponentState(this._reachProfilesStore.cloneFilters(
            [
                'freeText',
                'pageSize',
                'pageIndex',
                'sortBy',
                'sortDirection'
            ]
        ));
    }
    
    private _updateComponentState(updates: Partial<ReachProfilesFilters>): void {
        if (typeof updates.freeText !== 'undefined') {
            this._query.freeText = updates.freeText || '';
        }
    
        if (typeof updates.pageSize !== 'undefined') {
            this._query.pageSize = updates.pageSize;
        }
    
        if (typeof updates.pageIndex !== 'undefined') {
            this._query.pageIndex = updates.pageIndex;
        }
    
        if (typeof updates.sortBy !== 'undefined') {
            this._query.sortBy = updates.sortBy;
        }
    
        if (typeof updates.sortDirection !== 'undefined') {
            this._query.sortDirection = updates.sortDirection;
        }
    }
    
    public _onPaginationChanged(state): void {
        if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
            this._reachProfilesStore.filter({
                pageIndex: state.page,
                pageSize: state.rows
            });
        }
    }
    
    public _onSortChanged(event): void {
        if (event.field !== this._query.sortBy || event.order !== this._query.sortDirection) {
            this._reachProfilesStore.filter({
                sortBy: event.field,
                sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
            });
        }
    }
    
    public _onFreetextChanged(): void {
        // prevent searching for empty strings
        if (this._query.freeText.length > 0 && this._query.freeText.trim().length === 0){
            this._query.freeText = '';
        }else {
            this._reachProfilesStore.filter({freeText: this._query.freeText});
        }
    }

    public _actionSelected(event: { action: string, profile: KalturaReachProfileWithCredit }): void {
        switch (event.action) {
            case 'edit':
                this._logger.info(`handle 'edit' profile action by the user`, {profileId: event.profile.id});
                this._settingsReachViewService.open({ profile: event.profile, section: SettingsReachProfileViewSections.Settings });
                break;
            case 'duplicate':
                this._logger.info(`handle 'duplicate' action by the user`, {
                    id: event.profile.id,
                    name: event.profile.name
                });
                // if (!event.profile.isDefault) {
                //     this._deleteProfiles([event.profile]);
                // } else {
                //     this._logger.info(`cannot delete default profile, abort action`, { id: event.profile.id, name: event.profile.name });
                // }
                break;
            
            default:
                break;
        }
    }
}
