import { Component, ViewChild } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { UploadListTableComponent } from './upload-list-table.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { Router } from '@angular/router';

@Component({
  selector: 'kUploadControlList',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss'],
})
export class UploadListComponent {
  @ViewChild(UploadListTableComponent) private dataTable: UploadListTableComponent;

  public _selectedUploads = [];
  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _filter = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt'
  };

  constructor(private _appLocalization: AppLocalization,
              private _router: Router,
              private _browserService: BrowserService) {
  }

  _onPaginationChanged(event): void {
    console.log(event);
  }

  _onSortChanged(event): void {
    console.log(event);
  }

  _onActionSelected(event): void {
    console.log(event);
  }

  _clearSelection(): void {

  }
}

