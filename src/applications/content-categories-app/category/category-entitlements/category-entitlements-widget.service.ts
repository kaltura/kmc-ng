import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {KalturaMetadata} from 'kaltura-typescript-client/types/KalturaMetadata';
import {Observable} from 'rxjs/Observable';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CategoryWidgetKeys} from './../category-widget-keys';
import {Injectable, OnDestroy} from '@angular/core';
import {CategoryWidget} from '../category-widget';
import {KalturaMultiRequest} from 'kaltura-typescript-client';
import {KalturaNullableBoolean} from 'kaltura-typescript-client/types/KalturaNullableBoolean';
import {KalturaInheritanceType} from 'kaltura-typescript-client/types/KalturaInheritanceType';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-typescript-client/types/KalturaCategoryUserPermissionLevel';
import {KalturaPrivacyType} from 'kaltura-typescript-client/types/KalturaPrivacyType';
import {KalturaAppearInListType} from 'kaltura-typescript-client/types/KalturaAppearInListType';
import {KalturaContributionPolicyType} from 'kaltura-typescript-client/types/KalturaContributionPolicyType';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {CategoryGetAction} from 'kaltura-typescript-client/types/CategoryGetAction';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CategoryService} from '../category.service';

@Injectable()
export class CategoryEntitlementsWidget extends CategoryWidget implements OnDestroy {

  public entitlementsForm: FormGroup;
  private _categoryMetadata: KalturaMetadata[] = [];
  private _parentCategory = new BehaviorSubject<KalturaCategory>(null);
  public parentCategory$ = this._parentCategory.asObservable();

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
      return this._fetchData('activation');
    } else {
      this._resetFormData();
      this._monitorFormChanges();
      this._hideLoader();
      return Observable.of({failed: false});
    }
  }

  public _fetchData(origin: 'activation' | 'reload', reset: boolean = true, showLoader: boolean = true): Observable<{ failed: boolean, error?: Error }> {
    return Observable.create(observer => {
      if (showLoader) {
        super._showLoader();
      }
      if (reset) {
        this._parentCategory.next(null);
      }

      let requestSubscription = this._getParentCategory(this.data.parentId)
        .monitor('get category parent category')
        .cancelOnDestroy(this, this.widgetReset$)
        .subscribe(
          parentCategory => {
            super._hideLoader();
            this._parentCategory.next(parentCategory);
            this._resetFormData();
            this._monitorFormChanges();
            observer.next({failed: false});
            observer.complete();
          }, error => {
            this._parentCategory.next(null);
            super._hideLoader();
            if (origin === 'activation') {
              super._showActivationError();
            } else {
              this._showBlockerMessage(new AreaBlockerMessage(
                {
                  message: this._appLocalization.get('applications.content.categoryDetails.entitlements.inheritUsersPermissions.errors.categoryLoadError'),
                  buttons: [
                    {
                      label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
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
    const formsChanges: Observable<any>[] = [];
    formsChanges.push(this.entitlementsForm.valueChanges, this.entitlementsForm.statusChanges);

    Observable.merge(...formsChanges)
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
    const categoryInheritUsersPermission = this._parentCategory.getValue() && this.data.inheritanceType === KalturaInheritanceType.inherit;
    this.entitlementsForm.reset(
      {
        contentPrivacy: this.data.privacy || KalturaPrivacyType.all,
        categoryListing: this.data.appearInList || KalturaAppearInListType.partnerOnly,
        contentPublishPermissions: this.data.contributionPolicy || KalturaContributionPolicyType.all,
        moderateContent: this.data.moderation === KalturaNullableBoolean.trueValue || false,
        inheritUsersPermissions: categoryInheritUsersPermission || false,
        defaultPermissionLevel: {
          value: this.data.defaultPermissionLevel || KalturaCategoryUserPermissionLevel.member,
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
      return undefined;
    }

    const metadataFormValue = this.entitlementsForm.value;
    // save Entitlements Form
    newData.privacy = metadataFormValue.contentPrivacy;
    newData.appearInList = metadataFormValue.categoryListing;
    newData.contributionPolicy = metadataFormValue.contentPublishPermissions;
    newData.moderation = metadataFormValue.moderateContent === true ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
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
    this._categoryMetadata = [];
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


