import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from "app-shared/kmc-shell/providers/browser.service";

import { SchedulingParams } from './components/bulk-scheduling/bulk-scheduling.component';

@Component({
  selector: 'kBulkActions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent implements OnInit, OnDestroy {

  public _bulkActionsMenu: MenuItem[] = [];
  @Input() selectedEntries: any[];

  @ViewChild('schedulingPopup') public schedulingPopup: PopupWidgetComponent;

  constructor(private _appLocalization: AppLocalization, private _browserService : BrowserService) {

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
    }
    // this._browserService.setAppStatus({isBusy: true, errorMessage: null});
  }

  // get scheduling changes
  onSchedulingChanged(schedulingParams: SchedulingParams){
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

