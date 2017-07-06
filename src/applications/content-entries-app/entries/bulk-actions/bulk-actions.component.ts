import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from "app-shared/kmc-shell/providers/browser.service";

import { SchedulingParams } from './services'
import { BulkSchedulingService, BulkAddTagsService, BulkRemoveTagsService, BulkAddCategoriesService, EntryCategoryItem, BulkChangeOwnerService, BulkRemoveCategoriesService } from './services';
import { KalturaMediaEntry } from "kaltura-typescript-client/types/KalturaMediaEntry";
import { BulkActionBaseService } from "./services/bulk-action-base.service";
import { environment } from 'app-environment';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';

@Component({
  selector: 'kBulkActions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent implements OnInit, OnDestroy {

  public _bulkActionsMenu: MenuItem[] = [];
  public _bulkWindowWidth = 500;
  public _bulkWindowHeight = 500;
  public _bulkAction: string = "";

  @Input() selectedEntries: KalturaMediaEntry[];

  @Output() onBulkChange = new EventEmitter<{reload: boolean}>();

  @ViewChild('bulkActionsPopup') public bulkActionsPopup: PopupWidgetComponent;

  constructor(private _appLocalization: AppLocalization, private _browserService : BrowserService,
              private _bulkSchedulingService: BulkSchedulingService,
              private _bulkAddTagsService: BulkAddTagsService,
              private _bulkRemoveTagsService: BulkRemoveTagsService,
              private _bulkAddCategoriesService: BulkAddCategoriesService,
              private _bulkChangeOwnerService: BulkChangeOwnerService,
              private _bulkRemoveCategoriesService: BulkRemoveCategoriesService) {

  }

  ngOnInit(){
    this._bulkActionsMenu = this.getBulkActionItems();
  }

  ngOnDestroy(){

  }

  openBulkActionWindow(action: string, popupWidth: number, popupHeight: number){
    this._bulkAction = action;
    this._bulkWindowWidth = popupWidth;
    this._bulkWindowHeight = popupHeight;
    // use timeout to allow data binding of popup dimensions to update before opening the popup
    setTimeout(() => {
      this.bulkActionsPopup.open();
    }, 0);
  }

  // set scheduling changes
  onSchedulingChanged(schedulingParams: SchedulingParams): void{
    this.executeService(this._bulkSchedulingService, schedulingParams);
  }

  // add tags changed
  onAddTagsChanged(tags: string[]): void{
    this.executeService(this._bulkAddTagsService, tags);
  }

  // remove tags changed
  onRemoveTagsChanged(tags: string[]): void {
    this.executeService(this._bulkRemoveTagsService, tags);
  }

  // add to categories changed
  onAddToCategoriesChanged(categories: EntryCategoryItem[]): void{
    this.executeService(this._bulkAddCategoriesService, categories);
  }

  // remove categories changed
  onRemoveCategoriesChanged(categories: number[]): void{
    this.executeService(this._bulkRemoveCategoriesService, categories);
  }

  // owner changed
  onOwnerChanged(owners: KalturaUser[]): void{
    if (owners && owners.length){
      this.executeService(this._bulkChangeOwnerService, owners[0]);
    }
  }

  private executeService(service: BulkActionBaseService<any>, data: any, reloadEntries: boolean = true ): void{
    this._bulkAction = "";

    const execute = () => {
      this._browserService.setAppStatus({isBusy: true, errorMessage: null});
      service.execute(this.selectedEntries, data).subscribe(
          result => {
            this._browserService.setAppStatus({isBusy: false, errorMessage: null});
            this.onBulkChange.emit({reload: reloadEntries});
          },
          error => {
            this._browserService.setAppStatus({isBusy: false, errorMessage: this._appLocalization.get('applications.content.bulkActions.error')});
          }
      );
    }

    if (this.selectedEntries.length > environment.modules.contentEntries.bulkActionsLimit){
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirm', {"0": this.selectedEntries.length}),
          accept: () => {
            execute();
          }
        }
      );
    }else{
      execute();
    }
  }

  getBulkActionItems(): MenuItem[]{
    return  [
      { label: this._appLocalization.get('applications.content.bulkActions.setScheduling'), command: (event) => { this.openBulkActionWindow("setScheduling", 500, 500) } },
      { label: this._appLocalization.get('applications.content.bulkActions.setAccessControl'), command: (event) => { this.openBulkActionWindow("setAccessControl", 500, 500) } },
      { label: this._appLocalization.get('applications.content.bulkActions.addRemoveTags'), items: [
        { label: this._appLocalization.get('applications.content.bulkActions.addTags'), command: (event) => { this.openBulkActionWindow("addTags", 500, 500) } },
        { label: this._appLocalization.get('applications.content.bulkActions.removeTags'), command: (event) => { this.openBulkActionWindow("removeTags", 500, 500) } }]
      },
      { label: this._appLocalization.get('applications.content.bulkActions.addRemoveCategories'), items: [
        { label: this._appLocalization.get('applications.content.bulkActions.addToCategories'), command: (event) => { this.openBulkActionWindow("addToCategories", 560, 586) } },
        { label: this._appLocalization.get('applications.content.bulkActions.removeFromCategories'), command: (event) => { this.openBulkActionWindow("removeFromCategories", 500, 500) } }]
      },
      { label: this._appLocalization.get('applications.content.bulkActions.addToNewCategoryPlaylist'), items: [
        { label: this._appLocalization.get('applications.content.bulkActions.addToNewCategory'), command: (event) => { this.openBulkActionWindow("addToNewCategory", 500, 500) } },
        { label: this._appLocalization.get('applications.content.bulkActions.addToNewPlaylist'), command: (event) => { this.openBulkActionWindow("addToNewPlaylist", 500, 500) } }]
      },
      { label: this._appLocalization.get('applications.content.bulkActions.changeOwner'), command: (event) => { this.openBulkActionWindow("changeOwner", 500, 500) } },
      { label: this._appLocalization.get('applications.content.bulkActions.download'), command: (event) => { this.openBulkActionWindow("download", 500, 500) } },
      { label: this._appLocalization.get('applications.content.bulkActions.delete'), command: (event) => { this.openBulkActionWindow("delete", 500, 500) } }
    ];
  }
}