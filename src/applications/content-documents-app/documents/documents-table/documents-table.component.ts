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
import {KalturaDocumentEntry} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {globalConfig} from 'config/global';
import {KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {ColumnsResizeManagerService, ResizableColumnsTableName} from 'app-shared/kmc-shared/columns-resize-manager';
import {MenuItem} from 'primeng/api';
import {AnalyticsNewMainViewService} from "app-shared/kmc-shared/kmc-views";
import {AppAuthentication} from "app-shared/kmc-shell";

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
    @Input() set documents(data: KalturaDocumentEntry[]) {
        if (!this._deferredLoading) {
            this._documents = [];
            this._cdRef.detectChanges();
            this._documents = data;
            this._cdRef.detectChanges();
        } else {
            this._deferredDocuments = data;
        }
    }

    @Input() sortField: string = null;
    @Input() sortOrder: number = null;

    @Output() sortChanged = new EventEmitter<{ field: string, order: number }>();
    @Output() actionSelected = new EventEmitter<any>();

    @ViewChild('actionsmenu', {static: true}) private actionsMenu: Menu;

    private _deferredDocuments: KalturaDocumentEntry[];

    public _deferredLoading = true;
    public _emptyMessage = '';
    public _documents: KalturaDocumentEntry[] = [];
    public _items: MenuItem[];
    public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;

    public rowTrackBy: Function = (index: number, item: any) => item.id;
    public _loadThumbnailWithKs = false;
    public _ks = '';

    constructor(public _columnsResizeManager: ColumnsResizeManagerService,
                private _appLocalization: AppLocalization,
                private _appAuthentication: AppAuthentication,
                private _permissionsService: KMCPermissionsService,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private _cdRef: ChangeDetectorRef,
                private _el: ElementRef<HTMLElement>) {
    }

    ngOnInit() {
        this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
        this._loadThumbnailWithKs = this._appAuthentication.appUser.partnerInfo.loadThumbnailWithKs;
        this._ks = this._appAuthentication.appUser.ks;
    }

    ngAfterViewInit() {
        if (this._deferredLoading) {
            // use timeout to allow the DOM to render before setting the data to the datagrid.
            // This prevents the screen from hanging during datagrid rendering of the data.
            setTimeout(() => {
                this._deferredLoading = false;
                this._documents = this._deferredDocuments;
                this._deferredDocuments = null;
            }, 0);
        }

        this._columnsResizeManager.updateColumns(this._el.nativeElement);
    }

    openActionsMenu(event: any, document: KalturaDocumentEntry) {
        if (this.actionsMenu) {
            this.buildMenu(document);
            this.actionsMenu.toggle(event);
        }
    }

    ngOnDestroy() {
        this.actionsMenu.hide();
    }

    buildMenu(document: KalturaDocumentEntry): void {
        this._items = [
            {
                id: 'view',
                label: this._appLocalization.get('applications.content.table.view'),
                command: () => this.onActionSelected('view', document)
            },
            {
                id: 'download',
                label: this._appLocalization.get('applications.content.table.download'),
                command: () => this.onActionSelected('download', document)
            },
            {
                id: 'delete',
                label: this._appLocalization.get('applications.content.table.delete'),
                styleClass: 'kDanger',
                command: () => this.onActionSelected('delete', document)
            }
        ];
    }

    onActionSelected(action: string, document: KalturaDocumentEntry) {
        this.actionSelected.emit({'action': action, 'document': document});
    }

    onSortChanged(event) {
        if (event.field && event.order) {
            // primeng workaround: must check that field and order was provided to prevent reset of sort value
            this.sortChanged.emit({field: event.field, order: event.order});
        }
    }

    public _onThumbLoadError(event): void {
        event.target.style.display = 'none';
    }
}

