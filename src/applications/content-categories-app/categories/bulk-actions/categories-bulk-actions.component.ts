import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
@Component({
  selector: 'kCategoriesBulkActions',
  templateUrl: './categories-bulk-actions.component.html',
  styleUrls: ['./categories-bulk-actions.component.scss']
})
export class CategoriesBulkActionsComponent implements OnInit, OnDestroy {

  @Input() selectedCategories: any[];

  @Output() onBulkChange = new EventEmitter<{reload: boolean}>();

  @ViewChild('bulkActionsPopup') public bulkActionsPopup: PopupWidgetComponent;

  constructor(private _appLocalization: AppLocalization, ) {
  }

  ngOnInit(){
  }

  ngOnDestroy(){

  }
 
}