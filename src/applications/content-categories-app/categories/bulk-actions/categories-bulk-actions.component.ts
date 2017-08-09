import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
@Component({
  selector: 'kCategoriesBulkActions',
  templateUrl: './categories-bulk-actions.component.html',
  styleUrls: ['./categories-bulk-actions.component.scss']
})
export class CategoriesBulkActionsComponent implements OnInit, OnDestroy {

  @Input() selectedCategories: any[];

  @Output() onBulkChange = new EventEmitter<{reload: boolean}>();

  constructor(private _appLocalization: AppLocalization, ) {
  }

  ngOnInit(){
  }

  ngOnDestroy(){

  } 
}