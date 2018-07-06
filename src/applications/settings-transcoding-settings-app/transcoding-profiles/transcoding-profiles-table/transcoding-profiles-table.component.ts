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
import { Menu, MenuItem } from 'primeng/primeng';
import { KalturaConversionProfileWithAsset } from '../transcoding-profiles-store/base-transcoding-profiles-store.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ColumnsResizeManagerService, ResizableColumns } from 'app-shared/kmc-shared/columns-resize-manager';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';

@Component({
  selector: 'k-transcoding-profiles-table',
  templateUrl: './transcoding-profiles-table.component.html',
  styleUrls: ['./transcoding-profiles-table.component.scss'],
    providers: [ColumnsResizeManagerService]
})
export class TranscodingProfilesTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() set profiles(data: KalturaConversionProfileWithAsset[]) {
    if (!this._deferredLoading) {
      this._profiles = [];
      this._cdRef.detectChanges();
      this._profiles = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredProfiles = data;
    }
  }

    @Input() singleTableMode: boolean;
    @Input() profileType: KalturaConversionProfileType;
  @Input() selectedProfiles: KalturaConversionProfileWithAsset[] = [];

  @Output() selectedProfilesChange = new EventEmitter<KalturaConversionProfileWithAsset[]>();
  @Output() actionSelected = new EventEmitter<{ action: string, profile: KalturaConversionProfileWithAsset }>();

  @ViewChild('actionsmenu') private _actionsMenu: Menu;

    private _tableName: string;

  public _profiles = [];
  public _emptyMessage = '';
  public _items: MenuItem[];
  public _deferredLoading = true;
  public _deferredProfiles = [];
    public _columnsConfig: ResizableColumns;
    public _defaultColumnsConfig: ResizableColumns = {
        'name': 'auto',
        'description': 'auto',
        'profileId': '90px',
        'flavors': '110px'
    };
  public rowTrackBy: Function = (index: number, item: any) => item.id;
    @HostListener('window:resize') _windowResize(): void {
        if (this._columnsResizeManager.onWindowResize(this._tableName)) {
            this._columnsConfig = this._defaultColumnsConfig;
        }
    }

  constructor(public _columnsResizeManager: ColumnsResizeManagerService,
              private _appLocalization: AppLocalization,
              private _permissionsService: KMCPermissionsService,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
        if (this.profileType) {
            this._tableName = this.profileType === KalturaConversionProfileType.media ? 'trancodingmedia-table' : 'trancodinglive-table';
            this._columnsConfig = Object.assign(
                {},
                this._defaultColumnsConfig,
                this._columnsResizeManager.getConfig(this._tableName)
            );
            this._windowResize();
        }
    this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
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
    this._actionsMenu.hide();
  }

  private _buildMenu(profile: KalturaConversionProfileWithAsset): void {
    if (profile.isDefault) {
      this._items = [
        {
          id: 'edit',
          label: this._appLocalization.get('applications.settings.transcoding.edit'),
          command: () => this._onActionSelected('edit', profile)
        }
      ];
    } else {
      this._items = [
        {
          id: 'setAsDefault',
          label: this._appLocalization.get('applications.settings.transcoding.setAsDefault'),
          command: () => this._onActionSelected('setAsDefault', profile)
        },
        {
          id: 'edit',
          label: this._appLocalization.get('applications.settings.transcoding.edit'),
          command: () => this._onActionSelected('edit', profile)
        },
        {
          id: 'delete',
          label: this._appLocalization.get('applications.settings.transcoding.delete'),
          styleClass: 'kDanger',
          command: () => this._onActionSelected('delete', profile)
        }
      ];
    }

    this._permissionsService.filterList(<{ id: string }[]>this._items, { 'delete': KMCPermissions.TRANSCODING_DELETE });
  }

  public _onColumnResize(event: { delta: number, element: HTMLTableHeaderCellElement }): void {
      this._columnsResizeManager.onColumnResize(event, this._tableName);
  }

  public _openActionsMenu(event: any, profile: KalturaConversionProfileWithAsset): void {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      this._buildMenu(profile);
      this._actionsMenu.show(event);
    }
  }
  public _onActionSelected(action: string, profile: KalturaConversionProfileWithAsset): void {
    this.actionSelected.emit({ action, profile });
  }

  public _onSelectionChange(event): void {
    this.selectedProfilesChange.emit(event);
  }

}
