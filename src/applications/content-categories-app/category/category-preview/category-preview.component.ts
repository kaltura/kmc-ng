import { CategoryService, ActionTypes } from './../category.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@kaltura-ng/kaltura-ui/date.pipe';

@Component({
  selector: 'kCategoryPreview',
  templateUrl: './category-preview.component.html',
  styleUrls: ['./category-preview.component.scss']
})
export class CategoryPreviewComponent implements OnInit, OnDestroy {
  public _headerProperties = new Array();
  constructor(private _categoryStore: CategoryService,
    private _appLocalization: AppLocalization,
  ) { }

  ngOnInit() {

    this._categoryStore.state$
      .cancelOnDestroy(this)
      .subscribe(
      status => {

        if (status) {
          switch (status.action) {
            case ActionTypes.CategoryLoading:
              break;
            case ActionTypes.CategoryLoaded:
              this._buildCategoryHeaderProperties();
              break;
            case ActionTypes.CategoryLoadingFailed:
              break;
            case ActionTypes.CategorySaving:
              break;
            case ActionTypes.CategorySavingFailed:
              break;
            case ActionTypes.CategoryDataIsInvalid:
              break;
            case ActionTypes.ActiveSectionBusy:
              break;
            case ActionTypes.CategoryPrepareSavingFailed:
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

  private _buildCategoryHeaderProperties() {

    //console.log(this._categoryStore.category);

    const dp = new DatePipe();
    this._headerProperties.push(this._appLocalization.get('applications.content.categoryDetails.headerProps.id',
      { 0: this._categoryStore.category.id }));
    this._headerProperties.push(this._appLocalization.get('applications.content.categoryDetails.headerProps.subCategories',
      { 0: this._categoryStore.category.directSubCategoriesCount }));
    this._headerProperties.push(this._appLocalization.get('applications.content.categoryDetails.headerProps.entries',
      { 0: this._categoryStore.category.entriesCount }));
    this._headerProperties.push(this._appLocalization.get('applications.content.categoryDetails.headerProps.creationDate',
      { 0: dp.transform(this._categoryStore.category.createdAt.getTime(), 'DD/MM/YYYY') }));
    this._headerProperties.push(this._appLocalization.get('applications.content.categoryDetails.headerProps.lastUpdate',
      { 0: dp.transform(this._categoryStore.category.updatedAt.getTime(), 'DD/MM/YYYY') }));
    this._headerProperties.push(this._appLocalization.get('applications.content.categoryDetails.headerProps.createdBy',
      { 0: this._categoryStore.category.owner ? this._categoryStore.category.owner : ' ' }));
    this._headerProperties.push(this._appLocalization.get('applications.content.categoryDetails.headerProps.privacyContextLabel',
      { 0: this._categoryStore.category.privacyContexts ? this._categoryStore.category.privacyContexts : ' ' }));
  }
}
