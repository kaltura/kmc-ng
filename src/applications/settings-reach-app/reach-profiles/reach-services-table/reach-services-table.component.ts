import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { globalConfig } from "config/global";
import { KalturaVendorCatalogItem } from "kaltura-ngx-client";

@Component({
    selector: 'k-reach-services-table',
    templateUrl: './reach-services-table.component.html',
    styleUrls: ['./reach-services-table.component.scss']
})

export class ReachServicesTableComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() set services(data: KalturaVendorCatalogItem[]) {
        if (!this._deferredLoading) {
            this._services = [];
            this._cdRef.detectChanges();
            this._services = data;
            this._cdRef.detectChanges();
        } else {
            this._deferredProfiles = data;
        }
    }
    
    @Output() sortChanged = new EventEmitter<any>();
    
    public _services = [];
    public _emptyMessage = '';
    public _deferredLoading = true;
    public _deferredProfiles = [];
    public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
    
    public rowTrackBy: Function = (index: number, item: any) => item.id;
    
    constructor(protected _appLocalization: AppLocalization,
                protected _permissionsService: KMCPermissionsService,
                protected _cdRef: ChangeDetectorRef) {
    }
    
    ngOnInit() {
        this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
    }
    
    ngAfterViewInit() {
        if (this._deferredLoading) {
            // use timeout to allow the DOM to render before setting the data to the datagrid.
            // This prevents the screen from hanging during datagrid rendering of the data.
            setTimeout(() => {
                this._deferredLoading = false;
                this._services = this._deferredProfiles;
                this._deferredProfiles = null;
            }, 0);
        }
    }
    
    ngOnDestroy() {
    }
    
    public _onSortChanged(event) {
        if (event.field && event.order) {
            // primeng workaround: must check that field and order was provided to prevent reset of sort value
            this.sortChanged.emit({field: event.field, order: event.order});
        }
    }
}
