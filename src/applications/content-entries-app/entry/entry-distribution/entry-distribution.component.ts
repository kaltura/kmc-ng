import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntryDistributionWidget } from './entry-distribution-widget.service';


@Component({
  selector: 'kEntryDistribution',
  templateUrl: './entry-distribution.component.html',
  styleUrls: ['./entry-distribution.component.scss']
})
export class EntryDistribution implements OnInit, OnDestroy {

  public _loading = false;
  public _loadingError = null;

  constructor(public _widgetService: EntryDistributionWidget) {
  }


  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}

