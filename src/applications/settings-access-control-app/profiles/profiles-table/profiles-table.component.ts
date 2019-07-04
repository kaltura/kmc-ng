import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Menu } from 'primeng/menu';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaAccessControl } from 'kaltura-ngx-client';
import { globalConfig } from 'config/global';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'kAccessControlProfilesTable',
  templateUrl: './profiles-table.component.html',
  styleUrls: ['./profiles-table.component.scss']
})
export class ProfilesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  private _deferredProfiles: KalturaAccessControl[];

  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
  public _profiles: KalturaAccessControl[] = [];
  public _documentWidth = 2000;
  public _rowTrackBy: Function = (index: number, item: any) => item.id;

  @Input()
  set list(data: KalturaAccessControl[]) {
    if (!this._deferredLoading) {
      // the table profiles 'rowTrackBy' to track changes by id. To be able to reflect changes of profiles
      // (ie when returning from profiles list page) - we should force detect changes on an empty list
      this._profiles = [];
      this._cdRef.detectChanges();
      this._profiles = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredProfiles = data;
    }
  }

  @Input() filter: { sortBy?: string, sortDirection?: number } = {};
  @Input() selectedProfiles: KalturaAccessControl[] = [];

  @Output() actionSelected = new EventEmitter<{ action: string, profile: KalturaAccessControl }>();
  @Output() selectedProfilesChange = new EventEmitter<KalturaAccessControl[]>();
  @Output() sortChanged = new EventEmitter<{ field: string, order: number }>();

  @ViewChild('actionsmenu', { static: false }) private actionsMenu: Menu;

  public _deferredLoading = true;
  public _emptyMessage = '';
  public _items: MenuItem[];

  @HostListener('window:resize')
  private _updateDocumentListener(): void {
    this._documentWidth = document.body.clientWidth;
  }

  constructor(private _appLocalization: AppLocalization,
              private _appPermissions: KMCPermissionsService,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
    this._documentWidth = document.body.clientWidth;
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._profiles = this._deferredProfiles;
        this._deferredProfiles = null;
      }, 0);
    }
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }

  private _buildMenu(profile: KalturaAccessControl): void {
    this._items = [
      {
        id: 'edit',
        label: this._appLocalization.get('applications.settings.accessControl.table.actions.edit'),
        command: () => this._onActionSelected('edit', profile)
      },
      {
        id: 'delete',
        label: this._appLocalization.get('applications.settings.accessControl.table.actions.delete'),
        styleClass: 'kDanger',
        command: () => this._onActionSelected('delete', profile)
      },
    ];

    this._appPermissions.filterList(<{id: string}[]>this._items, { 'delete': KMCPermissions.ACCESS_CONTROL_DELETE });
  }

  private _onActionSelected(action: string, profile: KalturaAccessControl): void {
    this.actionSelected.emit({ action, profile });
  }

  public _openActionsMenu(event: Event, profile: KalturaAccessControl): void {
    if (this.actionsMenu) {
      this._buildMenu(profile);
      this.actionsMenu.toggle(event);
    }
  }

  public _onSelectionChange(event: KalturaAccessControl[]): void {
    this.selectedProfilesChange.emit(event);
  }

  public _onSortChanged(event: { field: string, order: number }): void {
    this.sortChanged.emit(event);
  }
}

