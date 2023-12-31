import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Menu} from 'primeng/menu';
import {KalturaBaseEntry, KalturaRoomEntry} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {globalConfig} from 'config/global';
import {KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {ColumnsResizeManagerService, ResizableColumnsTableName} from 'app-shared/kmc-shared/columns-resize-manager';
import {MenuItem} from 'primeng/api';
import {AnalyticsNewMainViewService} from "app-shared/kmc-shared/kmc-views";

@Component({
    selector: 'kDocumentsTable',
    templateUrl: './documents-table.component.html',
    styleUrls: ['./documents-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        {provide: ResizableColumnsTableName, useValue: 'documents-table'}
    ]
})
export class DocumentsTableComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input() set rooms(data: KalturaRoomEntry[]) {
        if (!this._deferredLoading) {
            this._rooms = [];
            this._cdRef.detectChanges();
            this._rooms = data;
            this._cdRef.detectChanges();
        } else {
            this._deferredRooms = data;
        }
    }

    @Input() sortField: string = null;
    @Input() sortOrder: number = null;

    @Output() sortChanged = new EventEmitter<{ field: string, order: number }>();
    @Output() actionSelected = new EventEmitter<any>();

    @ViewChild('actionsmenu', {static: true}) private actionsMenu: Menu;

    private _deferredRooms: KalturaRoomEntry[];

    public _deferredLoading = true;
    public _emptyMessage = '';
    public _rooms: KalturaRoomEntry[] = [];
    public _items: MenuItem[];
    public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;

    public rowTrackBy: Function = (index: number, item: any) => item.id;

    constructor(public _columnsResizeManager: ColumnsResizeManagerService,
                private _appLocalization: AppLocalization,
                private _permissionsService: KMCPermissionsService,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private _cdRef: ChangeDetectorRef,
                private _el: ElementRef<HTMLElement>) {
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
                this._rooms = this._deferredRooms;
                this._deferredRooms = null;
            }, 0);
        }

        this._columnsResizeManager.updateColumns(this._el.nativeElement);
    }

    openActionsMenu(event: any, room: KalturaRoomEntry) {
        if (this.actionsMenu) {
            this.buildMenu(room);
            this.actionsMenu.toggle(event);
        }
    }

    ngOnDestroy() {
        this.actionsMenu.hide();
    }

    buildMenu(room: KalturaRoomEntry): void {
        this._items = [
            {
                id: 'view',
                label: this._appLocalization.get('applications.content.table.view'),
                command: () => this.onActionSelected('view', room)
            },
            {
                id: 'delete',
                label: this._appLocalization.get('applications.content.table.delete'),
                styleClass: 'kDanger',
                command: () => this.onActionSelected('delete', room)
            }
        ];
    }

    onActionSelected(action: string, room: KalturaRoomEntry) {
        this.actionSelected.emit({'action': action, 'room': room});
    }

    onSortChanged(event) {
        if (event.field && event.order) {
            // primeng workaround: must check that field and order was provided to prevent reset of sort value
            this.sortChanged.emit({field: event.field, order: event.order});
        }
    }
}

