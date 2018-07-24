import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, ElementRef,
    EventEmitter, HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Menu, MenuItem} from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {KalturaCategory} from 'kaltura-ngx-client';
import { globalConfig } from 'config/global';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';
import { ReachAppViewService, ReachPages } from 'app-shared/kmc-shared/kmc-views/details-views';

@Component({
  selector: 'kCategoriesTable',
  templateUrl: './categories-table.component.html',
  styleUrls: ['./categories-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'categories-table' }
    ]
})
export class CategoriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input()
  set categories(data: any[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of categories
      // (ie when returning from category page) - we should force detect changes on an empty list
      this._categories = [];
      this.cdRef.detectChanges();
      this._categories = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredCategories = data;
    }
  }

  @Input() sortField: string = null;
  @Input() sortOrder: number = null;
  @Input() selectedCategories: KalturaCategory[] = [];

  @Output()
  sortChanged = new EventEmitter<{ field: string, order: number}>();
  @Output()
  actionSelected = new EventEmitter<{action: string, category: KalturaCategory}>();
  @Output()
  selectedCategoriesChange = new EventEmitter<any>();

  @ViewChild('actionsmenu') private _actionsMenu: Menu;

  private _deferredCategories: KalturaCategory[];

  public _categories: KalturaCategory[] = [];
  public _deferredLoading = true;
  public _emptyMessage = '';
  public _items: MenuItem[];
  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;

  public rowTrackBy: Function = (index: number, item: any) => item.id;

  constructor(public _columnsResizeManager: ColumnsResizeManagerService,
              private appLocalization: AppLocalization,
              private cdRef: ChangeDetectorRef,
              private _reachAppViewService: ReachAppViewService,
              private _el: ElementRef<HTMLElement>,
              private _permissionsService: KMCPermissionsService) {
  }

  ngOnInit() {
      this._emptyMessage = this.appLocalization.get('applications.content.table.noResults');

  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._categories = this._deferredCategories;
        this._deferredCategories = null;
      }, 0);
    }

    this._columnsResizeManager.updateColumns(this._el.nativeElement);
  }

  onActionSelected(action: string, category: KalturaCategory) {
    this.actionSelected.emit({'action': action, 'category': category});
  }

  openActionsMenu(event: any, category: KalturaCategory) {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      this.buildMenu(category);
      this._actionsMenu.show(event);
    }
  }
  buildMenu(category: KalturaCategory): void {
    this._items = [
      {
        id: 'edit',
        label: this.appLocalization.get('applications.content.categories.edit'),
        command: () => this.onActionSelected('edit', category)
      },
      {
        id: 'viewEntries',
        label: this.appLocalization.get('applications.content.categories.viewEntries'),
        command: () => this.onActionSelected('viewEntries', category)
      },
      {
        id: 'moveCategory',
        label: this.appLocalization.get('applications.content.categories.moveCategory'),
        command: () => this.onActionSelected('moveCategory', category)
      },
        {
            id: 'addServiceRule',
            label: this.appLocalization.get('applications.content.categories.addServiceRule'),
            command: () => this.onActionSelected('addServiceRule', category)
        },
      {
        id: 'delete',
        label: this.appLocalization.get('applications.content.categories.delete'),
        styleClass: 'kDanger',
        command: () => this.onActionSelected('delete', category)
      }
    ];

    this._permissionsService.filterList(
      <{ id: string }[]>this._items,
      {
        'moveCategory': KMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES,
        'delete': KMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES,
        'addServiceRule': this._reachAppViewService.isAvailable({ page: ReachPages.category, category })
      }
    );
  }

  _onSelectionChange(event) {
    this.selectedCategoriesChange.emit(event);
  }

  _onSortChanged(event) {
    if (event.field && event.order) {
      // primeng workaround: must check that field and order was provided to prevent reset of sort value
      this.sortChanged.emit({field: event.field, order: event.order});
    }
  }
}

