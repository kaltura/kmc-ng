import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { KalturaDocumentEntry } from 'kaltura-ngx-client';
import { DocumentDetailsWidget } from './document-details-widget.service';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from "@kaltura-ng/mc-shared";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'kDocumentDetails',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss']
})
export class DocumentDetailsComponent implements OnInit, OnDestroy {

  @Input() isRapt: boolean;

  public _currentDocument: KalturaDocumentEntry;
  public _isNew = false;

  constructor(
    public _widgetService: DocumentDetailsWidget,
    public _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this._widgetService.data$
      .pipe(cancelOnDestroy(this))
      .pipe(filter(Boolean))
      .subscribe((data: KalturaDocumentEntry) => {
        this._currentDocument = data;
        this._isNew = !this._currentDocument.id;
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}

