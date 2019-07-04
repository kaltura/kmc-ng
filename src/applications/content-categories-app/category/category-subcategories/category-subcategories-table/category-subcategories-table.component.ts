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
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaCategory} from 'kaltura-ngx-client';
import { Menu } from 'primeng/menu';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { globalConfig } from 'config/global';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'kCategorySubcategoriesTable',
  templateUrl: './category-subcategories-table.component.html',
  styleUrls: ['./category-subcategories-table.component.scss']
})
export class CategorySubcategoriesTableComponent implements OnInit, OnDestroy, AfterViewInit {
  public _subcategories: KalturaCategory[] = [];
  public _emptyMessage: string = this._appLocalization.get('applications.content.table.noResults');
  private _deferredSubcategories: any[];
  public _items: MenuItem[];
  public deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
  public _kmcPermissions = KMCPermissions;


  @Input() selectedSubcategories: KalturaCategory[] = [];
  @Output() selectedSubcategoriesChange = new EventEmitter<KalturaCategory[]>();

  @Input()
  set subcategories(data: KalturaCategory[]) {
    if (!this.deferredLoading) {
      this._subcategories = [];
      this.cdRef.detectChanges();
      this._subcategories = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredSubcategories = data;
    }
  }

  @Output() onActionSelected = new EventEmitter<{ action: string, subcategory: KalturaCategory }>();
  @ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;


  constructor(private cdRef: ChangeDetectorRef, private _appLocalization: AppLocalization) {
  }

  public rowTrackBy: Function = (index: number, item: any) => item;

  public _openActionsMenu(event: any, rowIndex: number, category: KalturaCategory) {
    if (this.actionsMenu) {
      this._buildMenu(rowIndex, category);
      this.actionsMenu.toggle(event);
    }
  }


  private _buildMenu(rowIndex: number, subcategory: KalturaCategory): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.categoryDetails.subcategories.actions.moveUp'),
        command: () => this.onActionSelected.emit({action: 'moveUp', subcategory}),
        disabled: rowIndex === 0
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.subcategories.actions.moveDown'),
        command: () => this.onActionSelected.emit({action: 'moveDown', subcategory}),
        disabled: rowIndex + 1 === this._subcategories.length
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.subcategories.actions.delete'),
        styleClass: 'kDanger',
        command: () => {
          this.onActionSelected.emit({action: 'delete', subcategory});
        }
      }
    ];
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    if (this.deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this.deferredLoading = false;
        this._subcategories = this._deferredSubcategories;
        this._deferredSubcategories = null;
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  public _onSelectionChange(event) {
    this.selectedSubcategoriesChange.emit(event);
  }

}
