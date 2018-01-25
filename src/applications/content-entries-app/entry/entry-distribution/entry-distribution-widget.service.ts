import { Injectable, OnDestroy } from '@angular/core';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import { EntryWidgetKeys } from '../entry-widget-keys';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { EntryWidget } from '../entry-widget';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EntryDistributionWidget extends EntryWidget implements OnDestroy {
  constructor(private _appLocalization: AppLocalization) {
    super(EntryWidgetKeys.Distribution);
  }

  ngOnDestroy() {

  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
  }

  protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean, error?: Error }> | void {

  }

  protected onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest): void {

  }

  public setDirty(): void {
    super.updateState({ isDirty: true });
  }
}
