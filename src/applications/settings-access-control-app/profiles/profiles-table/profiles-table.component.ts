import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AccessControlProfilesStore } from '../profiles-store/profiles-store.service';

@Component({
  selector: 'kAccessControlProfilesTable',
  templateUrl: './profiles-table.component.html',
  styleUrls: ['./profiles-table.component.scss']
})
export class ProfilesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  public _blockerMessage: AreaBlockerMessage = null;
  public _profiles: any[] = [];
  private _deferredProfiles: any[];

  @Input()
  set list(data: any[]) {
    if (!this._deferredLoading) {
      // the table profiles 'rowTrackBy' to track changes by id. To be able to reflect changes of profiles
      // (ie when returning from profiles list page) - we should force detect changes on an empty list
      this._profiles = [];
      this._cdRef.detectChanges();
      this._profiles = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredProfiles = data
    }
  }

  @Input() filter: any = {};
  @Input() selectedProfiles: any[] = [];

  @Output() actionSelected = new EventEmitter<{ action: string, profile: any }>();
  @Output() selectedProfilesChange = new EventEmitter<any>();
  @Output() sortChanged = new EventEmitter<any>();

  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  private _profile: any;

  public _deferredLoading = true;
  public _emptyMessage = '';
  public _items: MenuItem[];

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef,
              public _store: AccessControlProfilesStore) {
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to 'no results' only after search
    this._store.profiles.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          if (result.errorMessage) {
            this._blockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || this._appLocalization.get('applications.settings.accessControl.errors.loading'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._store.reload()
              }]
            })
          } else {
            this._blockerMessage = null;
            if (result.loading) {
              this._emptyMessage = '';
              loadedOnce = true;
            } else {
              if (loadedOnce) {
                this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
              }
            }
          }
        },
        error => {
          console.warn('[kmcng] -> could not load access control profiles'); // navigate to error page
          throw error;
        });
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

  private _buildMenu(): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.accessControl.table.actions.edit'),
        command: () => this._onActionSelected('edit', this._profile)
      },
      {
        label: this._appLocalization.get('applications.settings.accessControl.table.actions.delete'),
        command: () => this._onActionSelected('delete', this._profile)
      },
    ];
  }

  private _onActionSelected(action: string, profile: any): void {
    this.actionSelected.emit({ action, profile });
  }

  public _openActionsMenu(event: any, profile: any): void {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if (!this._profile || this._profile.id !== profile.id) {
        this._profile = profile;
        this._buildMenu();
        this.actionsMenu.show(event);
      }
    }
  }

  public _onSelectionChange(event: any): void {
    this.selectedProfilesChange.emit(event);
  }

  public _onSortChanged(event: any): void {
    this.sortChanged.emit(event);
  }
}

