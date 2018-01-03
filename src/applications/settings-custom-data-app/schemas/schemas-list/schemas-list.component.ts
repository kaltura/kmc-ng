import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kSchemasList',
  templateUrl: './schemas-list.component.html',
  styleUrls: ['./schemas-list.component.scss']
})
export class SchemasListComponent implements OnInit, OnDestroy {
  public _blockerMessage: AreaBlockerMessage = null;

  public _selectedSchemas: any[] = [];

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public _clearSelection(): void {
    this._selectedSchemas = [];
  }

  public _deleteSchemas(schemas: any[]): void {

  }

  public _addSchema(): void {

  }

  public _onPaginationChanged(event: any): void {

  }
}
