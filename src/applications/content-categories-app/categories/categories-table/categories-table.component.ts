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
import {ISubscription} from 'rxjs/Subscription';
import {Menu, MenuItem} from 'primeng/primeng';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from 'app-shared/kmc-shell';
import {CategoriesService} from '../categories.service';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';

@Component({
  selector: 'kCategoriesTable',
  templateUrl: './categories-table.component.html',
  styleUrls: ['./categories-table.component.scss']
})
export class CategoriesTableComponent implements AfterViewInit, OnInit, OnDestroy {

  public _blockerMessage: AreaBlockerMessage = null;

  public _categories: KalturaCategory[] = [];
  private _deferredCategories: any[];
  public _deferredLoading = true;

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
      this._deferredCategories = data
    }
  }

  @Input() filter: any = {};
  @Input() selectedCategories: KalturaCategory[] = [];

  @Output()
  sortChanged = new EventEmitter<any>();
  @Output()
  actionSelected = new EventEmitter<{action: string, category: KalturaCategory}>();
  @Output()
  selectedCategoriesChange = new EventEmitter<any>();

  @ViewChild('actionsmenu') private _actionsMenu: Menu;
  private _actionsMenuCategory: KalturaCategory;
  private _categoriesServiceStatusSubscription: ISubscription;

  public _emptyMessage = '';

  public _items: MenuItem[];

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private appLocalization: AppLocalization, public categoriesService: CategoriesService, private cdRef: ChangeDetectorRef, private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to "no results" only after search
    this._categoriesServiceStatusSubscription = this.categoriesService.categories.state$.subscribe(
      result => {
        if (result.errorMessage) {
          this._blockerMessage = new AreaBlockerMessage({
            message: result.errorMessage || 'Error loading categories',
            buttons: [{
              label: 'Retry',
              action: () => {
                this.categoriesService.reload();
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
        console.warn('[kmcng] -> could not load categories'); // navigate to error page
        throw error;
      });
  }

  ngOnDestroy() {
    this._categoriesServiceStatusSubscription.unsubscribe();
    this._categoriesServiceStatusSubscription = null;
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
  }

  onActionSelected(action: string, category: KalturaCategory) {
    this.actionSelected.emit({'action': action, 'category': category});
  }

  openActionsMenu(event: any, category: KalturaCategory) {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      if (!this._actionsMenuCategory || this._actionsMenuCategory.id !== category.id) {
        this.buildMenu();
        this._actionsMenuCategory = category;
        this._actionsMenu.show(event);
      }
    }
  }

  buildMenu(): void {
    this._items = [
      {
        label: this.appLocalization.get('applications.content.categories.edit'), command: (event) => {
        this.onActionSelected('edit', this._actionsMenuCategory);
      }
      },
      {
        label: this.appLocalization.get('applications.content.categories.delete'), command: (event) => {
        this.onActionSelected('delete', this._actionsMenuCategory);
      }
      },
      {
        label: this.appLocalization.get('applications.content.categories.viewEntries'), command: (event) => {
        this.onActionSelected('viewEntries', this._actionsMenuCategory);
      }
      },
      {
        label: this.appLocalization.get('applications.content.categories.moveCategory'), command: (event) => {
        this.onActionSelected('moveCategory', this._actionsMenuCategory);
      }
      }
    ];
  }

  _onSelectionChange(event) {
    this.selectedCategoriesChange.emit(event);
  }

  _onSortChanged(event) {
    this.sortChanged.emit(event);
  }
}

