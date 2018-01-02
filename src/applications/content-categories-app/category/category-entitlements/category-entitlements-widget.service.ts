import {Observable} from 'rxjs/Observable';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CategoryWidgetKeys} from './../category-widget-keys';
import {Injectable, OnDestroy} from '@angular/core';
import {CategoryWidget} from '../category-widget';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {CategoryService} from '../category.service';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {CategoryGetAction} from 'kaltura-ngx-client/api/types/CategoryGetAction';
import {KalturaInheritanceType} from 'kaltura-ngx-client/api/types/KalturaInheritanceType';
import {KalturaNullableBoolean} from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';

@Injectable()
export class CategoryEntitlementsWidget extends CategoryWidget implements OnDestroy {

  public entitlementsForm: FormGroup;
  public parentCategory: KalturaCategory = null;
  public membersTotalCount = 0;

  constructor(private _kalturaClient: KalturaClient,
              private _formBuilder: FormBuilder,
              private _appLocalization: AppLocalization,
              private _categoryService: CategoryService) {
    super(CategoryWidgetKeys.Entitlements);

    this._buildForm();
  }

  protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean }> {
    super._showLoader();
    super._removeBlockerMessage();
    if (this.data.parentId > 0) {
      super._showLoader();
      super._removeBlockerMessage();
      this.membersTotalCount = this.data.membersCount;
      return this._fetchData('activation');
    } else {
      this._resetFormData();
      this._monitorFormChanges();
      this._hideLoader();
      return Observable.of({failed: false});
    }
  }

  public _fetchData(origin: 'activation' | 'reload', reset: boolean = true, showLoader: boolean = true):
                  Observable<{ failed: boolean, error?: Error }> {
    return Observable.create(observer => {
      if (showLoader) {
        super._showLoader();
      }
      if (reset) {
        this.parentCategory = null;
      }

      let requestSubscription = this._getParentCategory(this.data.parentId)
        .monitor('get category parent category')
        .cancelOnDestroy(this, this.widgetReset$)
        .subscribe(
          parentCategory => {
            super._hideLoader();
            this.parentCategory = parentCategory;
            this._resetFormData();
            this._monitorFormChanges();
            observer.next({failed: false});
            observer.complete();
          }, error => {
            this.parentCategory = null;
            super._hideLoader();
            if (origin === 'activation') {
              super._showActivationError();
            } else {
              this._showBlockerMessage(new AreaBlockerMessage(
                {
                  message: this._appLocalization
                    .get('applications.content.categoryDetails.entitlements.inheritUsersPermissions.errors.categoryLoadError'),
                  buttons: [
                    {
                      label: this._appLocalization.get('app.common.retry'),
                      action: () => {
                        this.refresh(reset);
                      }
                    }
                  ]
                }
              ), true);
            }
            observer.error({failed: true, error});
          }
        );
      return () => {
        if (requestSubscription) {
          requestSubscription.unsubscribe();
          requestSubscription = null;
        }
      }
    });
  }

  private _getParentCategory(parentCategoryId: number): Observable<KalturaCategory> {
    if (!parentCategoryId) {
      return Observable.throw(new Error('parentCategoryId to get Parent category for is not defined'));
    }

    return <any>this._kalturaClient.request(
      new CategoryGetAction({
        id: parentCategoryId
      })
    );
  }

  private _buildForm(): void {
    this.entitlementsForm = this._formBuilder.group({
      contentPrivacy: null,
      categoryListing: null,
      contentPublishPermissions: null,
      moderateContent: null,
      inheritUsersPermissions: null, // no
      defaultPermissionLevel: {value: null, disabled: true},
      owner: '',
      permittedUsers: []
    });
  }

  private _monitorFormChanges() {
    Observable.merge(this.entitlementsForm.valueChanges, this.entitlementsForm.statusChanges)
      .cancelOnDestroy(this, this.widgetReset$)
      .subscribe(
        () => {
          const isValid = this.entitlementsForm.status === 'VALID';
          const isDirty = this.entitlementsForm.dirty;
          if (this.isDirty !== isDirty || this.isValid !== isValid) {
            super.updateState({
              isValid: isValid,
              isDirty: isDirty
            });
          }
        }
      );
  }

  public setDirty() {
    super.updateState({
      isDirty: true
    });
  }

  private _resetFormData() {
    const categoryInheritUsersPermission = this.parentCategory && this.data.inheritanceType === KalturaInheritanceType.inherit;
    this.entitlementsForm.reset(
      {
        contentPrivacy: this.data.privacy,
        categoryListing: this.data.appearInList,
        contentPublishPermissions: this.data.contributionPolicy,
        moderateContent: this.data.moderation === KalturaNullableBoolean.trueValue,
        inheritUsersPermissions: categoryInheritUsersPermission,
        defaultPermissionLevel: {
          value: this.data.defaultPermissionLevel,
          disabled: categoryInheritUsersPermission
        },
        owner: {
          value: this.data.owner || '',
          disabled: categoryInheritUsersPermission
        },
        permittedUsers: []
      }
    );
  }


  protected onDataSaving(newData: KalturaCategory, request: KalturaMultiRequest): void {

    if (!this.entitlementsForm.valid) {
      throw new Error('Cannot perform save operation since the entitlement form is invalid');
    }

    const metadataFormValue = this.entitlementsForm.value;
    // save Entitlements Form
    newData.privacy = metadataFormValue.contentPrivacy;
    newData.appearInList = metadataFormValue.categoryListing;
    newData.contributionPolicy = metadataFormValue.contentPublishPermissions;
    newData.moderation = metadataFormValue.moderateContent !== true ? KalturaNullableBoolean.falseValue : KalturaNullableBoolean.trueValue;
    newData.inheritanceType = metadataFormValue.inheritUsersPermissions ? KalturaInheritanceType.inherit : KalturaInheritanceType.manual;
    if (!metadataFormValue.inheritUsersPermissions) {
      newData.defaultPermissionLevel = metadataFormValue.defaultPermissionLevel;
      newData.owner = metadataFormValue.owner;
    }
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
    this.entitlementsForm.reset({});
    this.parentCategory = null;
    this.membersTotalCount = 0;
  }

  onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
    return Observable.create(observer => {
      this.entitlementsForm.updateValueAndValidity();
      const isValid = this.entitlementsForm.valid;
      observer.next({isValid});
      observer.complete();
    });
  }

  public refresh(reset = false, showLoader = true) {
    this._fetchData('reload', reset, showLoader)
      .cancelOnDestroy(this, this.widgetReset$)
      .subscribe(() => {
      });
  }

  ngOnDestroy() {
  }

  public openCategory(category: KalturaCategory) {
    if (category && category.id) {
      this._categoryService.openCategory(category.id);
    }
  }
}


