import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from "app-shared/kmc-shell/providers/browser.service";

import { SchedulingParams } from './services'
import { BulkSchedulingService } from './services';

@Component({
  selector: 'kBulkActions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent implements OnInit, OnDestroy {

  public _bulkActionsMenu: MenuItem[] = [];
  @Input() selectedEntries: any[];

  @Output() onBulkChange = new EventEmitter<{reload: boolean}>();

  @ViewChild('schedulingPopup') public schedulingPopup: PopupWidgetComponent;
  @ViewChild('addTagsPopup') public addTagsPopup: PopupWidgetComponent;

  constructor(private _appLocalization: AppLocalization, private _browserService : BrowserService, private _bulkSchedulingService: BulkSchedulingService) {

  }

  ngOnInit(){
    this._bulkActionsMenu = this.getBulkActionItems();
  }

  ngOnDestroy(){

  }

  executeBulkAction(action: string){
    switch (action){
      case "setScheduling":
        this.schedulingPopup.open();
        break;
      case "addTags":
        this.addTagsPopup.open();
        break;
    }
    // this._browserService.setAppStatus({isBusy: true, errorMessage: null});
  }

  // get scheduling changes
  onSchedulingChanged(schedulingParams: SchedulingParams): void{
    this._browserService.setAppStatus({isBusy: true, errorMessage: null});
    this._bulkSchedulingService.execute(this.selectedEntries, schedulingParams).subscribe(
      result => {
        this._browserService.setAppStatus({isBusy: false, errorMessage: null});
        this.onBulkChange.emit({reload: true});
      },
      error => {
        this._browserService.setAppStatus({isBusy: false, errorMessage: this._appLocalization.get('applications.content.bulkActions.error')});
      }
    );
  }

  // add tags changed
  onAddTagsChanged(tags: string[]): void{
    debugger;
  }

  getBulkActionItems(): MenuItem[]{
    return  [
      { label: this._appLocalization.get('applications.content.bulkActions.setScheduling'), command: (event) => { this.executeBulkAction("setScheduling") } },
      { label: this._appLocalization.get('applications.content.bulkActions.setAccessControl'), command: (event) => { this.executeBulkAction("setAccessControl") } },
      { label: this._appLocalization.get('applications.content.bulkActions.addRemoveTags'), items: [
        { label: this._appLocalization.get('applications.content.bulkActions.addTags'), command: (event) => { this.executeBulkAction("addTags") } },
        { label: this._appLocalization.get('applications.content.bulkActions.removeTags'), command: (event) => { this.executeBulkAction("removeTags") } }]
      },
      { label: this._appLocalization.get('applications.content.bulkActions.addRemoveCategories'), items: [
        { label: this._appLocalization.get('applications.content.bulkActions.addToCategories'), command: (event) => { this.executeBulkAction("addToCategories") } },
        { label: this._appLocalization.get('applications.content.bulkActions.removeFromCategories'), command: (event) => { this.executeBulkAction("removeFromCategories") } }]
      },
      { label: this._appLocalization.get('applications.content.bulkActions.addToNewCategoryPlaylist'), items: [
        { label: this._appLocalization.get('applications.content.bulkActions.addToNewCategory'), command: (event) => { this.executeBulkAction("addToNewCategory") } },
        { label: this._appLocalization.get('applications.content.bulkActions.addToNewPlaylist'), command: (event) => { this.executeBulkAction("addToNewPlaylist") } }]
      },
      { label: this._appLocalization.get('applications.content.bulkActions.changeOwner'), command: (event) => { this.executeBulkAction("changeOwner") } },
      { label: this._appLocalization.get('applications.content.bulkActions.download'), command: (event) => { this.executeBulkAction("download") } },
      { label: this._appLocalization.get('applications.content.bulkActions.delete'), command: (event) => { this.executeBulkAction("delete") } }
    ];
  }
}

