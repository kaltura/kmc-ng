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
import {KalturaBaseEntry, KalturaPlaylist} from 'kaltura-ngx-client';
import {KalturaEntryStatus} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {globalConfig} from 'config/global';
import {KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {ColumnsResizeManagerService, ResizableColumnsTableName} from 'app-shared/kmc-shared/columns-resize-manager';
import {MenuItem} from 'primeng/api';
import {ExtendedPlaylist} from "../playlists-store/playlists-store.service";
import {AnalyticsNewMainViewService} from "app-shared/kmc-shared/kmc-views";

@Component({
    selector: 'kPlaylistsTable',
    templateUrl: './playlists-table.component.html',
    styleUrls: ['./playlists-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        {provide: ResizableColumnsTableName, useValue: 'playlists-table'}
    ]
})
export class PlaylistsTableComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input() set playlists(data: KalturaPlaylist[]) {
        if (!this._deferredLoading) {
            this._playlists = [];
            this._cdRef.detectChanges();
            this._playlists = data;
            this._cdRef.detectChanges();
        } else {
            this._deferredPlaylists = data;
        }
    }

    @Input() sortField: string = null;
    @Input() sortOrder: number = null;
    @Input() selectedPlaylists: any[] = [];

    @Output() sortChanged = new EventEmitter<{ field: string, order: number }>();
    @Output() selectedPlaylistsChange = new EventEmitter<any>();
    @Output() actionSelected = new EventEmitter<any>();

    @ViewChild('actionsmenu', {static: true}) private actionsMenu: Menu;

    private _deferredPlaylists: KalturaPlaylist[];

    public _deferredLoading = true;
    public _emptyMessage = '';
    public _playlists: KalturaPlaylist[] = [];
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
                this._playlists = this._deferredPlaylists;
                this._deferredPlaylists = null;
            }, 0);
        }

        this._columnsResizeManager.updateColumns(this._el.nativeElement);
    }

    openActionsMenu(event: any, playlist: KalturaPlaylist) {
        if (this.actionsMenu) {
            this.buildMenu(playlist);
            this.actionsMenu.toggle(event);
        }
    }

    ngOnDestroy() {
        this.actionsMenu.hide();
    }

    buildMenu(playlist: ExtendedPlaylist): void {
        this._items = [
            {
                id: 'previewAndEmbed',
                label: this._appLocalization.get('applications.content.table.previewAndEmbed'),
                command: () => this.onActionSelected('preview', playlist)
            },
            {
                id: 'view',
                label: this._appLocalization.get('applications.content.table.view'),
                command: () => this.onActionSelected('view', playlist)
            }
        ];

        if (playlist.status !== KalturaEntryStatus.ready || playlist.isRapt || playlist.isPath) {
            this._items.shift();
        } else {
            const hasEmbedPermission = this._permissionsService.hasPermission(KMCPermissions.PLAYLIST_EMBED_CODE);
            if (!hasEmbedPermission) {
                this._items[0].label = this._appLocalization.get('applications.content.table.previewInPlayer');
            }
        }

        if (this._analyticsNewMainViewService.isAvailable() && (playlist.isRapt || playlist.isPath || playlist.isManual)) {
            this._items.push(
                {
                    id: 'analytics',
                    label: this._appLocalization.get('applications.content.entries.viewAnalytics'),
                    command: () => this.onActionSelected('analytics', playlist)
                }
            );
        }
        this._items.push(
            {
                id: 'delete',
                label: this._appLocalization.get('applications.content.table.delete'),
                styleClass: 'kDanger',
                command: () => this.onActionSelected('delete', playlist)
            }
        );

        this._permissionsService.filterList(
            <{ id: string }[]>this._items,
            {
                'delete': KMCPermissions.PLAYLIST_DELETE
            }
        );
    }


    onSelectionChange(event) {
        this.selectedPlaylistsChange.emit(event);
    }

    onActionSelected(action: string, playlist: KalturaBaseEntry) {
        this.actionSelected.emit({'action': action, 'playlist': playlist});
    }

    onSortChanged(event) {
        if (event.field && event.order) {
            // primeng workaround: must check that field and order was provided to prevent reset of sort value
            this.sortChanged.emit({field: event.field, order: event.order});
        }
    }
}

