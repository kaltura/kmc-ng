import {Component, OnDestroy, OnInit} from '@angular/core';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {CategorySubcategoriesWidget} from './category-subcategories-widget.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';


@Component({
  selector: 'kCategorySubcategories',
  templateUrl: './category-subcategories.component.html',
  styleUrls: ['./category-subcategories.component.scss']
})
export class CategorySubcategoriesComponent implements OnInit, OnDestroy {

  public _emptyMessage: string = null; // todo: implement
  public _selectedSubcategories: KalturaCategory[] = [];
  public _subcategories: KalturaCategory[] = [];
  private _subcategoriesCount: number;

  constructor(public _widgetService: CategorySubcategoriesWidget,
              private _appLocalization: AppLocalization) {
  }

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  public get totalSubcategories(): string {
    return this._appLocalization.get('applications.content.categoryDetails.subcategories.tableHeaderDetails.total',
      {'0': this._subcategoriesCount});
  }


  ngOnInit() {
    this._widgetService.attachForm();
    this._widgetService.subcategories$.subscribe(subcategories => {
      this._subcategories = subcategories;
      this._subcategoriesCount = subcategories.length;
    })
  }


  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}
