import {
  CategoriesBulkAddTagsService,
  CategoriesBulkChangeCategoryListingService,
  CategoriesBulkChangeContentPrivacyService,
  CategoriesBulkChangeContributionPolicyService,
  CategoriesBulkChangeOwnerService,
  CategoriesBulkDeleteService,
  CategoriesBulkRemoveTagsService
} from './services';
import {CategoriesBulkActionBaseService} from './services/categories-bulk-action-base.service';
import {MenuItem} from 'primeng/primeng';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {KalturaCategory} from "kaltura-ngx-client/api/types/KalturaCategory";
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import {BrowserService} from "app-shared/kmc-shell";
import {environment} from 'app-environment';
import {KalturaUser} from "kaltura-ngx-client/api/types/KalturaUser";
import {PrivacyMode} from "./components/bulk-change-content-privacy/bulk-change-content-privacy.component";
import {KalturaPrivacyType} from "kaltura-ngx-client/api/types/KalturaPrivacyType";
import {KalturaAppearInListType} from "kaltura-ngx-client/api/types/KalturaAppearInListType";
import {AppearInListType} from "./components/bulk-change-category-listing/bulk-change-category-listing.component";
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaContributionPolicyType} from "kaltura-ngx-client/api/types/KalturaContributionPolicyType";
import {CategoriesUtilsService} from "../../categories-utils.service";

@Component({
  selector: 'kCategoriesBulkActions',
  templateUrl: './categories-bulk-actions.component.html',
  styleUrls: ['./categories-bulk-actions.component.scss']
})
export class CategoriesBulkActionsComponent implements OnInit, OnDestroy {

  public _bulkActionsMenu: MenuItem[] = [];
  public _bulkWindowWidth = 500;
  public _bulkWindowHeight = 500;
  public _bulkAction: string = "";

  @Input() selectedCategories: KalturaCategory[];

  @Output() onBulkChange = new EventEmitter<{ reload: boolean }>();

  @ViewChild('bulkActionsPopup') public bulkActionsPopup: PopupWidgetComponent;


  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _bulkAddTagsService: CategoriesBulkAddTagsService,
              private _bulkRemoveTagsService: CategoriesBulkRemoveTagsService,
              private _bulkChangeOwnerService: CategoriesBulkChangeOwnerService,
              private _bulkDeleteService: CategoriesBulkDeleteService,
              private _bulkChangeContentPrivacyService: CategoriesBulkChangeContentPrivacyService,
              private _bulkChangeCategoryListingService: CategoriesBulkChangeCategoryListingService,
              private _bulkChangeContributionPolicyService: CategoriesBulkChangeContributionPolicyService,
              private _categoriesUtilsService: CategoriesUtilsService) {
  }

  ngOnInit() {
    this._bulkActionsMenu = this.getBulkActionItems();
  }

  ngOnDestroy() {

  }

  getBulkActionItems(): MenuItem[] {
    return [
      {
        label: this._appLocalization.get('applications.content.categories.bActions.addRemoveTags'), items: [
          { label: this._appLocalization.get('applications.content.categories.bActions.addTags'), command: (event) => { this.openBulkActionWindow("addTags", 500, 500) } },
          { label: this._appLocalization.get('applications.content.categories.bActions.removeTags'), command: (event) => { this.openBulkActionWindow("removeTags", 500, 500) } }]
      },
      { label: this._appLocalization.get('applications.content.categories.bActions.moveCategories'), command: (event) => { this.openBulkActionWindow("moveCategories", 500, 500) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeContentPrivacy'), command: (event) => { this.openBulkActionWindow("changeContentPrivacy", 586, 352) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryListing'), command: (event) => { this.openBulkActionWindow("changeCategoryListing", 586, 314) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeContributionPolicy'), command: (event) => { this.openBulkActionWindow("changeContributionPolicy", 586, 314) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryOwner'), command: (event) => { this.openBulkActionWindow("changeOwner", 500, 280) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.delete'), command: (event) => { this.deleteCategories() } }
    ];
  }

  openBulkActionWindow(action: string, popupWidth: number, popupHeight: number) {

    if (this._categoriesUtilsService.hasEditWarnings(this.selectedCategories)) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.editCategory'),
          message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
          accept: () => {
            // use timeout to allow data binding of popup dimensions to update before opening the popup
            setTimeout(() => {
              this._bulkAction = action;
              this._bulkWindowWidth = popupWidth;
              this._bulkWindowHeight = popupHeight;
              this.bulkActionsPopup.open();
            }, 0);
          }
        }
      );
    } else {
      // use timeout to allow data binding of popup dimensions to update before opening the popup
      setTimeout(() => {
          this._bulkAction = action;
          this._bulkWindowWidth = popupWidth;
          this._bulkWindowHeight = popupHeight;
          this.bulkActionsPopup.open();
      }, 0);
    }

  }

  // add tags changed
  onAddTagsChanged(tags: string[]): void {
    this.executeService(this._bulkAddTagsService, tags);
  }

  // remove tags changed
  onRemoveTagsChanged(tags: string[]): void {
    this.executeService(this._bulkRemoveTagsService, tags);
  }

  // owner changed
  onOwnerChanged(owners: KalturaUser[]): void {
    if (owners && owners.length) {
      this.executeService(this._bulkChangeOwnerService, owners[0]);
    }
  }

  // change content privacy
  onChangeContentPrivacyChanged(privacyMode: PrivacyMode): void {
    let privacyType: KalturaPrivacyType;
    if (privacyMode === PrivacyMode.NoRestriction)
      privacyType = KalturaPrivacyType.all;
    if (privacyMode === PrivacyMode.Private)
      privacyType = KalturaPrivacyType.membersOnly;
    if (privacyMode === PrivacyMode.RequiresAuthentication)
      privacyType = KalturaPrivacyType.authenticatedUsers;

    this.executeService(this._bulkChangeContentPrivacyService, privacyType);
  }

  // change category listing
  onChangeCategoryListingChanged(appearInList: AppearInListType): void {
    let appearInListType: KalturaAppearInListType;
    if (appearInList === AppearInListType.NoRestriction)
      appearInListType = KalturaAppearInListType.partnerOnly;
    if (appearInList === AppearInListType.Private)
      appearInListType = KalturaAppearInListType.categoryMembersOnly;

    this.executeService(this._bulkChangeCategoryListingService, appearInListType);
  }

  // change contribution policy
  onChangeContributionPolicyChanged(policyType: KalturaContributionPolicyType): void {
    this.executeService(this._bulkChangeContributionPolicyService, policyType);
  }

  // bulk delete
  public deleteCategories(): void {

    this._categoriesUtilsService.confirmDeleteMultiple(this.selectedCategories)
      .cancelOnDestroy(this)
      .first()
      .subscribe(result => {
        setTimeout(() => {
          this.executeService(this._bulkDeleteService, {}, true, false);
          // need to use a timeout between multiple confirm dialogues (if more than 50 entries are selected)
        }, 0);
      });
  }


  private executeService(service: CategoriesBulkActionBaseService<any>, data: any = {}, reloadCategories: boolean = true, confirmChunks: boolean = true, callback?: Function): void {
    this._bulkAction = "";

    const execute = () => {
      service.execute(this.selectedCategories, data)
        .tag('block-shell')
        .subscribe(
        result => {
          if (callback) {
            callback(result);
          }
          this.onBulkChange.emit({ reload: reloadCategories });
        },
        error => {
          this._browserService.setAppStatus({ errorMessage: this._appLocalization.get('applications.content.bulkActions.error') });
          this.onBulkChange.emit({ reload: reloadCategories });
        }
      );
    };

    if (confirmChunks && this.selectedCategories.length > environment.modules.contentCategories.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirm', { "0": this.selectedCategories.length }),
          accept: () => {
            execute();
          }
        }
      );
    } else {
      execute();
    }
  }

}
