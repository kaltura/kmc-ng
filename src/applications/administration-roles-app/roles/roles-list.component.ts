import { ISubscription } from 'rxjs/Subscription';
import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { RolesTableComponent } from './roles-table.component';
import { RolesService, SortDirection } from './roles.service';
import {KalturaUserRole} from 'kaltura-typescript-client/types/KalturaUserRole';

@Component({
    selector: 'kRolesList',
    templateUrl: './roles-list.component.html',
    styleUrls: ['./roles-list.component.scss'],
    providers: [RolesService]
})

export class RolesListComponent implements OnInit, OnDestroy {

    @ViewChild(RolesTableComponent) private dataTable: RolesTableComponent;

    public _isBusy = false
    public _blockerMessage: AreaBlockerMessage = null;
    public _roles: KalturaUserRole[] = [];
    public _rolesTotalCount: number = null;
    private rolesSubscription: ISubscription;
    private querySubscription: ISubscription;

    public _filter = {
        pageIndex: 0,
        pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
        // sortBy: 'updatedAt',
        // sortDirection: SortDirection.Desc
    };

    constructor(private _rolesService: RolesService, private router: Router) {
    }

    ngOnInit() {

        this.querySubscription = this._rolesService.queryData$.subscribe(
            query => {
                this._filter.pageSize = query.pageSize;
                this._filter.pageIndex = query.pageIndex - 1;
                // this._filter.sortBy = query.sortBy;
                // this._filter.sortDirection = query.sortDirection;
                this.dataTable.scrollToTop();
            });

        this.rolesSubscription = this._rolesService.roles$.subscribe(
            (data) => {
                this._roles = data.items;
                this._rolesTotalCount = data.totalCount;
            }
        );
    }

    ngOnDestroy() {
        this.rolesSubscription.unsubscribe();
        this.querySubscription.unsubscribe();
    }

    public _reload() {
        this._rolesService.reload(true);
    }

    _onPaginationChanged(state: any): void {
        if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {

            this._rolesService.reload({
                pageIndex: state.page + 1,
                pageSize: state.rows
            });
        }
    }

    _onActionSelected(event: { action: string, roleID: number }) {
        switch (event.action) {
            case 'edit':
                this.router.navigate(['/administration/roles/role', event.roleID]);
                break;
            default:
                break;
        }
    }
}
