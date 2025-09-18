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
import {KalturaDocumentEntry, KalturaEntryModerationStatus} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {globalConfig} from 'config/global';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
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
    public _showActionsColumn = true;

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
        this._showActionsColumn = this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_METADATA) ||
            this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_DELETE) ||
            this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_DOWNLOAD);
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
        this._items = [];
        if (this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_METADATA)) {
            this._items.push({
                id: 'view',
                label: this._appLocalization.get('applications.content.table.view'),
                command: () => this.onActionSelected('view', document)
            });
        }
        if (this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_DOWNLOAD)) {
            this._items.push({
                id: 'download',
                label: this._appLocalization.get('applications.content.table.download'),
                command: () => this.onActionSelected('download', document)
            });
        }
        if (this._permissionsService.hasPermission(KMCPermissions.CONTENT_MODERATE_APPROVE_REJECT)  && (document.moderationStatus === KalturaEntryModerationStatus.pendingModeration || document.moderationStatus === KalturaEntryModerationStatus.flaggedForReview)) {
            this._items.push({
                label: this._appLocalization.get('applications.content.table.approve'),
                command: () => this.onActionSelected('approve', document)
            });
            this._items.push({
                label: this._appLocalization.get('applications.content.table.reject'),
                command: () => this.onActionSelected('reject', document)
            });
        }
        if (this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_DELETE)) {
            this._items.push({
                label: this._appLocalization.get('applications.content.table.delete'),
                styleClass: 'kDanger',
                command: () => this.onActionSelected('delete', document)
            });
        }
    }

    onActionSelected(action: string, document: KalturaDocumentEntry) {
        if (action === 'view' && !this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_METADATA)) return;
        this.actionSelected.emit({'action': action, 'document': document});
    }

    onSortChanged(event) {
        if (event.field && event.order) {
            // primeng workaround: must check that field and order was provided to prevent reset of sort value
            this.sortChanged.emit({field: event.field, order: event.order});
        }
    }

    public _onThumbLoadError(event: any, holder: HTMLDivElement): void {
        event.target.style.display = 'none';
        holder.classList.add('showIcon');
    }

    public getThumbnailClass(name: string): string {
        let type = 'default';
        // try to get document type by file extension
        if (name.indexOf('.') > -1) {
            const arr = name.split('.');
            const extension = arr[arr.length - 1].toLowerCase(); // get the last array item
            type = ['doc','docx','odt','rtf','tex','txt','wpd'].indexOf(extension) > -1 ? 'document' : type;
            type = extension === 'pdf' ? 'pdf' : type;
            type = ['xls','xlsx','xlsm','ods','csv'].indexOf(extension) > -1 ? 'spreadsheet' : type;
            // type = ['dat','db','log','mdb','sav','sql','tar', 'xml'].indexOf(extension) > -1 ? 'data' : type;
            type = ['key','odp','pps','ppt','pptx'].indexOf(extension) > -1 ? 'presentation' : type;
            type = ['mp3', 'aif', 'cda', 'mid', 'mp3', 'mpa', 'ogg', 'wav', 'wma', 'wpl'].indexOf(extension) > -1 ? 'audio' : type;
            type = ['ai' ,'jpg', 'bmp', 'gif', 'ico', 'jpeg', 'png', 'ps' , 'psd', 'svg', 'tif'].indexOf(extension) > -1 ? 'image' : type;
            type = ['7z', 'arj', 'deb', 'pkg', 'rar', 'rpm', 'tar', 'gz', 'z', 'zip'].indexOf(extension) > -1 ? 'archive' : type;
            type = ['3g2', '3gp', 'avi', 'flv', 'h264', 'm4v', 'mkv', 'mov', 'mp4', 'mpg', 'rm', 'swf', 'vob' ,'wmv'].indexOf(extension) > -1 ? 'video' : type;
        }
        return type;
    }
}

