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
import {KalturaCategory} from "kaltura-typescript-client/types/KalturaCategory";
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import {BrowserService} from "app-shared/kmc-shell";
import {environment} from 'app-environment';
import {KalturaUser} from "kaltura-typescript-client/types/KalturaUser";
import {PrivacyMode} from "./components/bulk-change-content-privacy/bulk-change-content-privacy.component";
import {KalturaPrivacyType} from "kaltura-typescript-client/types/KalturaPrivacyType";
import {KalturaAppearInListType} from "kaltura-typescript-client/types/KalturaAppearInListType";
import {AppearInListType} from "./components/bulk-change-category-listing/bulk-change-category-listing.component";
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaContributionPolicyType } from "kaltura-typescript-client/types/KalturaContributionPolicyType";

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


  constructor(private _appLocalization: AppLocalization, private _browserService: BrowserService,
    private _bulkAddTagsService: CategoriesBulkAddTagsService,
    private _bulkRemoveTagsService: CategoriesBulkRemoveTagsService,
    private _bulkChangeOwnerService: CategoriesBulkChangeOwnerService,
    private _bulkDeleteService: CategoriesBulkDeleteService,
    private _bulkChangeContentPrivacyService: CategoriesBulkChangeContentPrivacyService,
    private _bulkChangeCategoryListingService: CategoriesBulkChangeCategoryListingService,
    private _bulkChangeContributionPolicyService: CategoriesBulkChangeContributionPolicyService) {
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

    if (this.hasEditWarnings()) {
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
    let message: string = "";
    let deleteMessage: string = "";

    if (this.hasEditWarnings()) {
      deleteMessage = this._appLocalization.get('applications.content.categories.editWarning');
    }

    let isSubCategoriesExist: boolean = false;
    this.selectedCategories.forEach(obj => {
      if (obj.directSubCategoriesCount && obj.directSubCategoriesCount > 0) { isSubCategoriesExist = true; }
    });
    if (isSubCategoriesExist) {
      message = deleteMessage.concat(this.selectedCategories.length > 1 ?
        this._appLocalization.get('applications.content.categories.confirmDeleteMultipleWithSubCategories') :
        this._appLocalization.get('applications.content.categories.confirmDeleteWithSubCategories'));
    }
    else {
      message = deleteMessage.concat(this.selectedCategories.length > 1 ?
        this._appLocalization.get('applications.content.categories.confirmDeleteMultiple') :
        this._appLocalization.get('applications.content.categories.confirmDeleteSingle'));
    }

    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.categories.deleteCategories'),
        message: message,
        accept: () => {
          setTimeout(() => {
            this.executeService(this._bulkDeleteService, {}, true, false);
            // need to use a timeout between multiple confirm dialogues (if more than 50 entries are selected)
          }, 0);
        }
      }
    );
  }

  private hasEditWarnings(): boolean {
    const editWarningsExists: boolean =
      // Find one of the selected categories that has '__EditWarning' in its 'tags' property
      !!this.selectedCategories.find(obj => {
          return (obj.tags && obj.tags.indexOf('__EditWarning') > -1);
        });

    return editWarningsExists;
  }

  private executeService(service: CategoriesBulkActionBaseService<any>, data: any = {}, reloadCategories: boolean = true, confirmChunks: boolean = true, callback?: Function): void {
    this._bulkAction = "";

    const execute = () => {
      service.execute(this.selectedCategories, data)
        .tag('block-shell')
        .subscribe(
        result => {
          this._browserService.showGrowlMessage({  severity : 'success',
            detail: this._appLocalization.get('applications.content.categories.bActions.success')});
          this._browserService.setAppStatus({ errorMessage: null });
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
