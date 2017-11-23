import {Component, OnDestroy, OnInit} from '@angular/core';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {CategoryDetailsWidget} from './category-details-widget.service';

@Component({
  selector: 'kCategoryDetails',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  public _currentCategory: KalturaCategory;

  constructor(public _widgetService: CategoryDetailsWidget) {
  }

  ngOnInit() {

    this._widgetService.attachForm();
    this._widgetService.data$
      .cancelOnDestroy(this)
      .filter(Boolean)
      .subscribe(data => {
        this._currentCategory = data;
      });
  }


  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}
