import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { PlaylistRule } from '../playlist-rule/playlist-rule.interface';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kPlaylistRulesTable',
  templateUrl: './playlist-rules-table.component.html',
  styleUrls: ['./playlist-rules-table.component.scss']
})
export class PlaylistRulesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  @Input()
  set isNewPlaylist(value) {
    this._isNewPlaylist = value;
    if (value) {
      this.assignEmptyMessage();
    }
  };

  @Input() selectedRules: PlaylistRule[] = [];
  @Input() filter: any = {};

  @Input()
  set rules(data: any[]) {
    if (!this._deferredLoading) {
      this._rules = [];
      this._cdRef.detectChanges();
      this._rules = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredRules = data
    }
  }

  @Output() selectedRulesChange = new EventEmitter<any>();
  @Output() onActionSelected = new EventEmitter<{ action: string, rule: PlaylistRule }>();

  private _deferredRules: PlaylistRule[];
  public _rules: PlaylistRule[] = [];
  public _emptyMessage: string;
  public _deferredLoading = true;
  public _items: MenuItem[];
  public _isNewPlaylist: boolean;
  public _kmcPermissions = KMCPermissions;

  constructor(private _appLocalization: AppLocalization,
              private _permissionsService: KMCPermissionsService,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.assignEmptyMessage();
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._rules = this._deferredRules;
        this._deferredRules = null;
      }, 0);
    }
  }

  ngOnDestroy() {
  }

  private _buildMenu(rowIndex: number, rule: PlaylistRule): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.bulkActions.viewRule'),
        command: () => this.onActionSelected.emit({ action: 'view', rule: rule })
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveUp'),
        command: () => this.onActionSelected.emit({ action: 'moveUp', rule: rule }),
        disabled: rowIndex === 0
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveDown'),
        command: () => this.onActionSelected.emit({ action: 'moveDown', rule: rule }),
        disabled: rowIndex + 1 === this._rules.length
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.deleteRule'),
        styleClass: 'kDanger',
        command: () => this.onActionSelected.emit({ action: 'remove', rule: rule })
      }
    ];
  }

  public _openActionsMenu(event: any, rowIndex: number, rule: PlaylistRule): void {
    if (this.actionsMenu) {
      this._buildMenu(rowIndex, rule);
      this.actionsMenu.toggle(event);
      this.actionsMenu.show(event);
    }
  }

  public _onSelectionChange(event): void {
    this.selectedRulesChange.emit(event);
  }

  public _viewRule(rule: PlaylistRule): void {
    if (this._permissionsService.hasPermission(KMCPermissions.PLAYLIST_UPDATE)) {
      this.onActionSelected.emit({ action: 'view', rule: rule });
    }
  }

  public assignEmptyMessage(): void {
    this._emptyMessage = this._appLocalization.get('applications.content.playlistDetails.errors.addRules');
  }
}

