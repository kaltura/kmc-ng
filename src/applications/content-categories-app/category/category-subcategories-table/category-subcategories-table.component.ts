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
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {Menu} from 'primeng/primeng';
import {CustomMenuItem} from 'app-shared/content-shared/entries-table/entries-table.component';

@Component({
  selector: 'kCategorySubcategoriesTable',
  templateUrl: './category-subcategories-table.component.html',
  styleUrls: ['./category-subcategories-table.component.scss']
})
export class CategorySubcategoriesTableComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() rowActions: { label: string, commandName: string }[] = [];
  private _subcategories: KalturaCategory[] = [];
  public _emptyMessage: string = null; // todo: implement
  private _deferredSubcategories: any[];
  private actionsMenuCategoryId: number = null;
  public _items: CustomMenuItem[];
  public deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;
  @Input() selectedSubcategories: KalturaCategory[] = [];
  @Input()
  set subcategories(data: KalturaCategory[]) {
    if (!this.deferredLoading) {
      this._subcategories = [];
      this.cdRef.detectChanges();
      this._subcategories = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredSubcategories = data
    }
  }

  @Output() selectedSubcategoriesChange = new EventEmitter<KalturaCategory[]>();
  @Output() actionSelected = new EventEmitter<{ action: string, categoryId: number }>();
  @ViewChild('actionsmenu') private actionsMenu: Menu;


  constructor(private cdRef: ChangeDetectorRef) {
  }

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  public _openActionsMenu(event: any, category: KalturaCategory) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if (this.actionsMenuCategoryId !== category.id) {
        this.actionsMenuCategoryId = category.id;
        this._buildMenu();
        this.actionsMenu.show(event);
      }
    }
  }

  private _buildMenu(): void {
    this._items = this.rowActions
      // .filter(item => this._exceptPreview(status, item))
      // .filter(item => this._exceptView(mediaType, item))
      .map(action =>
        Object.assign({}, action, {
          command: ({ item }) => {
            this._onActionSelected(item.commandName, this.actionsMenuCategoryId);
          }
        })
      );
  }

  public _onActionSelected(action: string, categoryId: number) {
    this.actionSelected.emit({ action, categoryId });
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
}
