import { CategoriesBulkActionBaseService } from './services/categories-bulk-action-base.service';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { KalturaCategory } from "kaltura-typescript-client/types/KalturaCategory";
import { PopupWidgetComponent } from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import { BrowserService } from "app-shared/kmc-shell";
import { environment } from 'app-environment';

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


  constructor(private _appLocalization: AppLocalization, private _browserService: BrowserService) {
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
      { label: this._appLocalization.get('applications.content.categories.bActions.changeContentPrivacy'), command: (event) => { this.openBulkActionWindow("moveCategories", 500, 500) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryListing'), command: (event) => { this.openBulkActionWindow("moveCategories", 500, 500) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeContributionPolicy'), command: (event) => { this.openBulkActionWindow("moveCategories", 500, 500) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryOwner'), command: (event) => { this.openBulkActionWindow("moveCategories", 500, 500) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.delete'), command: (event) => { this.openBulkActionWindow("moveCategories", 500, 500) } }
    ];
  }

  openBulkActionWindow(action: string, popupWidth: number, popupHeight: number) {
    this._bulkAction = action;
    this._bulkWindowWidth = popupWidth;
    this._bulkWindowHeight = popupHeight;
    // use timeout to allow data binding of popup dimensions to update before opening the popup
    setTimeout(() => {
      this.bulkActionsPopup.open();
    }, 0);
  }

  // add tags changed
  onAddTagsChanged(tags: string[]): void {
    //this.executeService(this._categoriesBulkAddTagsService, tags)    ;
  }

}