import {Component, OnDestroy, OnInit} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client';
import {CategoryDetailsWidget} from './category-details-widget.service';
import {ActionTypes, CategoryService} from '../category.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kCategoryDetails',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss'],
    providers: [KalturaLogger.createLogger('CategoryDetailsComponent')]
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  public _currentCategory: KalturaCategory;
  public _parentCategoryId: number;

  constructor(private _categoryStore: CategoryService,
              private _logger: KalturaLogger,
              public _widgetService: CategoryDetailsWidget) {
  }

  ngOnInit() {
    this._categoryStore.state$
      .pipe(cancelOnDestroy(this))
      .subscribe(
      status => {

        if (status) {
          switch (status.action) {
            case ActionTypes.CategoryLoaded:
              this._currentCategory = this._categoryStore.category;
              this._parentCategoryId = this._currentCategory.parentId;
              break;
            default:
              break;
          }
        }
      },
      error => {
        // TODO [kmcng] navigate to error page
        throw error;
      });
  }


  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _onParentClicked(event: any) {
      this._logger.info(`handle navigate to parent category action by user`, { parentCategoryId: this._parentCategoryId });
    this._categoryStore.openCategory(this._parentCategoryId);
  }
}
