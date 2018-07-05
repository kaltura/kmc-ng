import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter, HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Menu, MenuItem} from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {KalturaUserRole} from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ColumnsResizeManagerService, ResizableColumns, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';

@Component({
  selector: 'kRolesTable',
  templateUrl: './roles-table.component.html',
  styleUrls: ['./roles-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'roles-table' }
    ]
})
export class RolesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input()
  set roles(data: KalturaUserRole[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of roles
      // (ie when returning from entry page) - we should force detect changes on an empty list
      this._roles = [];
      this._cdRef.detectChanges();
      this._roles = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredRoles = data;
    }
  }

  @Output() actionSelected = new EventEmitter<any>();

  @ViewChild('actionsmenu') private _actionsMenu: Menu;

  private _deferredRoles: KalturaUserRole[];

    public _columnsConfig: ResizableColumns;
    public _defaultColumnsConfig: ResizableColumns = {
        'role': '250px',
        'description': 'auto'
    };
  public _roles: KalturaUserRole[] = [];
  public _deferredLoading = true;
  public _emptyMessage = '';
  public _items: MenuItem[];
  public _rowTrackBy: Function = (index: number, item: any) => item.id;

    @HostListener('window:resize') _windowResize(): void {
        if (this._columnsResizeManager.onWindowResize()) {
            this._columnsConfig = this._defaultColumnsConfig;
        }
    }

  constructor(public _columnsResizeManager: ColumnsResizeManagerService,
              private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef,
              private _permissionsService: KMCPermissionsService) {
      this._columnsConfig = Object.assign(
          {},
          this._defaultColumnsConfig,
          this._columnsResizeManager.getConfig()
      );
  }

  ngOnInit() {
    this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._roles = this._deferredRoles;
        this._deferredRoles = null;
      }, 0);
    }
  }

  private _onActionSelected(action: string, role: KalturaUserRole): void {
    this.actionSelected.emit({ action, role });
  }

  private _buildMenu(role: KalturaUserRole): void {
    this._items = [
      {
        id: 'edit',
        label: this._appLocalization.get('applications.administration.roles.actions.edit'),
        command: () => this._onActionSelected('edit', role)
      },
      {
        id: 'duplicate',
        label: this._appLocalization.get('applications.administration.roles.actions.duplicate'),
        command: () => this._onActionSelected('duplicate', role)
      },
      {
        id: 'delete',
        label: this._appLocalization.get('applications.administration.roles.actions.delete'),
        styleClass: 'kDanger',
        command: () => this._onActionSelected('delete', role)
      }
    ];

    this._permissionsService.filterList(
      <{ id: string }[]>this._items,
      {
        'duplicate': KMCPermissions.ADMIN_ROLE_ADD,
        'delete': KMCPermissions.ADMIN_ROLE_DELETE
      }
    );
  }

  public _openActionsMenu(event: any, role: KalturaUserRole): void {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      this._buildMenu(role);
      this._actionsMenu.show(event);
    }
  }
}

