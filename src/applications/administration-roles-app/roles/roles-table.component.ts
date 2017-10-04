import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {MenuItem, DataTable, Menu} from 'primeng/primeng';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {RolesService} from './roles.service';
import {KalturaUserRole} from 'kaltura-typescript-client/types/KalturaUserRole';

@Component({
  selector: 'kRolesTable',
  templateUrl: './roles-table.component.html',
  styleUrls: ['./roles-table.component.scss']
})
export class RolesTableComponent implements AfterViewInit, OnInit, OnDestroy {

  public _blockerMessage: AreaBlockerMessage = null;

  public _roles: KalturaUserRole[] = [];
  private _deferredRoles: any[];

  @Input()
  set roles(data: any[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
      // (ie when returning from entry page) - we should force detect changes on an empty list
      this._roles = [];
      this.cdRef.detectChanges();
      this._roles = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredRoles = data
    }
  }

  @Input() filter: any = {};
  @Input() selectedRoles: KalturaUserRole[] = [];
  @Output() actionSelected = new EventEmitter<any>();
  @ViewChild('dataTable') private _dataTable: DataTable;
  @ViewChild('actionsmenu') private _actionsMenu: Menu;
  private _actionsMenuRole: KalturaUserRole;

  public _deferredLoading = true;
  public _emptyMessage = '';

  public _items: MenuItem[];

  public rowTrackBy: Function = (index: number, item: any) => item.id;

  constructor(private appLocalization: AppLocalization, public rolesService: RolesService, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to "no results" only after search
    this.rolesService.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          if (result.errorMessage) {
            this._blockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || 'Error loading entries',
              buttons: [{
                label: 'Retry',
                action: () => {
                  this.rolesService.reload(true);
                }
              }
              ]
            })
          } else {
            this._blockerMessage = null;
            if (result.loading) {
              this._emptyMessage = '';
              loadedOnce = true;
            } else {
              if (loadedOnce) {
                this._emptyMessage = this.appLocalization.get('applications.content.table.noResults');
              }
            }
          }
        },
        error => {
          console.warn('[kmcng] -> could not load user roles'); // navigate to error page
          throw error;
        });
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    const scrollBody = this._dataTable.el.nativeElement.getElementsByClassName('ui-datatable-scrollable-body');
    if (scrollBody && scrollBody.length > 0) {
      scrollBody[0].onscroll = () => {
        if (this._actionsMenu) {
          this._actionsMenu.hide();
        }
      }
    }
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

  onActionSelected(action: string, role: KalturaUserRole) {
    this.actionSelected.emit({'action': action, 'role': role});
  }

  openActionsMenu(event: any, role: KalturaUserRole) {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      if (!this._actionsMenuRole || this._actionsMenuRole.id !== role.id) {
        this.buildMenu();
        this._actionsMenuRole = role;
        this._actionsMenu.show(event);
      }
    }
  }

  buildMenu(): void {
    this._items = [
      {
        label: this.appLocalization.get('applications.administration.roles.actions.edit'), command: (event) => {
        this.onActionSelected('edit', this._actionsMenuRole);
      }
      },
      {
        label: this.appLocalization.get('applications.administration.roles.actions.duplicate'), command: (event) => {
        this.onActionSelected('duplicate', this._actionsMenuRole);
      }
      },
      {
        label: this.appLocalization.get('applications.administration.roles.actions.delete'), command: (event) => {
        this.onActionSelected('delete', this._actionsMenuRole);
      }
      }
    ];
  }

  scrollToTop() {
    const scrollBodyArr = this._dataTable.el.nativeElement.getElementsByClassName('ui-datatable-scrollable-body');
    if (scrollBodyArr && scrollBodyArr.length > 0) {
      const scrollBody: HTMLDivElement = scrollBodyArr[0];
      scrollBody.scrollTop = 0;
    }
  }
}

