import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoryService} from '../category.service';
import {BrowserService} from 'app-shared/kmc-shell';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {CategorySubcategoriesWidget} from './category-subcategories-widget.service';
import {AppLocalization} from "@kaltura-ng/kaltura-common";

@Component({
  selector: 'kCategorySubcategories',
  templateUrl: './category-subcategories.component.html',
  styleUrls: ['./category-subcategories.component.scss']
})
export class CategorySubcategoriesComponent implements OnInit, OnDestroy {

  // @Input() rowActions: { label: string, commandName: string }[] = [];
  public _emptyMessage: string = null; // todo: implement
  public _subcategories: KalturaCategory[] = [];
  public _selectedSubcategories: KalturaCategory[] = []; // todo: implement
  public _rowActions: { label: string, commandName: string }[];

  constructor(public _widgetService: CategorySubcategoriesWidget, public _categoryService: CategoryService, private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };


  ngOnInit() {
    this.fillRowActions();

    this._widgetService.attachForm();

    this._widgetService.subcategories$
      .cancelOnDestroy(this)
      .subscribe(
        subcategories => {
          this._subcategories = subcategories;
        }
      );
  }

  private fillRowActions() {
    this._rowActions = [
      {
        label: this._appLocalization.get('applications.content.categoryDetails.subcategories.actions.moveUp'),
        commandName: 'moveUp'
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.subcategories.actions.moveDown'),
        commandName: 'moveDown'
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.subcategories.actions.delete'),
        commandName: 'delete'
      }
    ];
  }

  private _onActionsSelected(event) {
    console.log('TODO: REMOVE event: ', event); // TODO: IMPLEMENT AND REMOVE LINE
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

}
