import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { KalturaClient } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { BulkRemoveCategoriesService } from '../../services/';
import { KalturaCategory } from 'kaltura-ngx-client';

@Component({
  selector: 'kBulkRemoveCategories',
  templateUrl: './bulk-remove-categories.component.html',
  styleUrls: ['./bulk-remove-categories.component.scss']
})
export class BulkRemoveCategories implements OnInit, OnDestroy, AfterViewInit {

  @Input() selectedEntries: KalturaMediaEntry[];
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() removeCategoriesChanged = new EventEmitter<string[]>();

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;

  public categories: any[] = [];
  private categoriesToRemove: string[] = [];

  private _parentPopupStateChangeSubscribe : ISubscription;
  private _confirmClose: boolean = true;

  constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService, private _bulkRemoveCategoriesService: BulkRemoveCategoriesService) {
  }

  ngOnInit() {
      // load categories
      this._sectionBlockerMessage = null;

      const entries = this.selectedEntries ? this.selectedEntries.map(entry => entry.id) : [];

      if (entries.length === 0) {
          this._showErrorMessage(this._appLocalization.get('applications.content.bulkActions.removeCategoriesNone'));
      } else {

          this._loading = true;

          this._bulkRemoveCategoriesService.getCategoriesOfEntries(this.selectedEntries.map(entry => entry.id)).subscribe(
              (response) => {
                  this._loading = false;
                  if (response && response.length) {
                      this.categories = [];
                      response.forEach(category => {
                          this.categories.push({selected: false, id: category.id, label: category.fullName});
                      });
                      this.categories.sort(function (a, b) {
                          return (a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0);
                      });
                  } else {
                      this._showErrorMessage(this._appLocalization.get('applications.content.bulkActions.removeCategoriesNone'));
                  }
              },
              error => {
                  this._loading = false;
                  this._showErrorMessage(error.message);
              }
          );
      }
  }

  private _showErrorMessage(message: string): void{
      this._sectionBlockerMessage = new AreaBlockerMessage(
          {
              message: message,
              buttons: [
                  {
                      label: this._appLocalization.get('app.common.close'),
                      action: () => {
                          this._confirmClose = false;
                          this.parentPopupWidget.close();
                      }
                  }
              ]
          }
      );
  }

  ngAfterViewInit(){
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose){
              if (this.categoriesToRemove.length && this._confirmClose){
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                      this._confirmClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy(){
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }

  updateSelectedCategories(){
    this.categoriesToRemove = [];
    this.categories.forEach(category=>{
      if (category.selected){
        this.categoriesToRemove.push(category.id);
      }
    });
  }

  public _apply(){
    this.removeCategoriesChanged.emit(this.categoriesToRemove);
    this._confirmClose = false;
    this.parentPopupWidget.close();
  }
}

