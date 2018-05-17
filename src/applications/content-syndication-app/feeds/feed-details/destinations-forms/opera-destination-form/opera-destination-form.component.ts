import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {KalturaOperaSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaOperaSyndicationFeed';
import { DestinationComponentBase, FeedFormMode } from '../../feed-details.component';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kOperaDestinationForm',
  templateUrl: './opera-destination-form.component.html',
  styleUrls: ['./opera-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: OperaDestinationFormComponent}]
})
export class OperaDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {
  @Input() mode: FeedFormMode;

  @Output()
  onFormStateChanged = new EventEmitter<{ isValid: boolean, isDirty: boolean }>();

  constructor(private _permissionsService: KMCPermissionsService) {
    super();
  }

  ngOnInit() {
    if (this.mode !== 'edit' || this._permissionsService.hasPermission(KMCPermissions.SYNDICATION_UPDATE)) {
      this.onFormStateChanged.emit({
        isValid: true,
        isDirty: false
      });
    }
  }

  ngOnDestroy() {
  }

  public getData(): KalturaOperaSyndicationFeed {
    return new KalturaOperaSyndicationFeed();
  }
}
