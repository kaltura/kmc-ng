import {ActionTypes, CategoryService} from './../category.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';

@Component({
  selector: 'kCategoryDetails',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  public _currentCategory: KalturaCategory;

  constructor(private _categoryStore: CategoryService,
    private _appLocalization: AppLocalization) {
  }




  ngOnInit() {
    this._categoryStore.state$
      .cancelOnDestroy(this)
      .subscribe(
      status => {

        if (status) {
          switch (status.action) {
            case ActionTypes.CategoryLoaded:
              this._currentCategory = this._categoryStore.category;
              break;
            default:
              break;
          }
        }
      },
      error => {
        // TODO [kmc] navigate to error page
        throw error;
      });
  }


  ngOnDestroy() {
  }
}
