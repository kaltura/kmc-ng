import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client';
import {Menu, MenuItem} from 'primeng/primeng';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kEntitlementsTable',
  templateUrl: './entitlement-table.component.html',
  styleUrls: ['./entitlement-table.component.scss']
})
export class EntitlementTableComponent implements OnInit, OnDestroy, AfterViewInit {

  public _entitlements: KalturaCategory[] = [];
  public _emptyMessage: string = this._appLocalization.get('applications.content.table.noResults');
  private _deferredEntitlements: KalturaCategory[];
  public _items: MenuItem[];
  public _deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;

  @Input()
  set entitlements(data: KalturaCategory[]) {
    if (!this._deferredLoading) {
      this._entitlements = [];
      this.cdRef.detectChanges();
      this._entitlements = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredEntitlements = data;
    }
  }

  @Output() onActionSelected = new EventEmitter<{ action: string, entitlement: KalturaCategory }>();
  @ViewChild('actionsmenu') private actionsMenu: Menu;


  constructor(private cdRef: ChangeDetectorRef,
              private _appLocalization: AppLocalization,
              private _permissionsService: KMCPermissionsService) {
  }

  public rowTrackBy: Function = (index: number, item: any) => item;

  public _openActionsMenu(event: any, category: KalturaCategory) {
    if (this.actionsMenu) {
      this._buildMenu(category);
      this.actionsMenu.toggle(event);
      this.actionsMenu.show(event);
    }
  }


  private _buildMenu(entitlement: KalturaCategory): void {
    const hasEditPermission = this._permissionsService.hasPermission(KMCPermissions.INTEGRATION_UPDATE_SETTINGS);
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.entitlement.table.actions.edit'),
        disabled: !hasEditPermission,
        command: () => {
          this.onActionSelected.emit({action: 'edit', entitlement});
        }
      },
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.entitlement.table.actions.delete'),
        disabled: !hasEditPermission,
        styleClass: 'kDanger',
        command: () => {
          this.onActionSelected.emit({action: 'delete', entitlement});
        }
      }
    ];
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._entitlements = this._deferredEntitlements;
        this._deferredEntitlements = null;
        this.cdRef.detectChanges();
      }, 0);
    }
  }

}
