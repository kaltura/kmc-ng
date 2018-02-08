import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {KalturaOperaSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaOperaSyndicationFeed';
import {DestinationComponentBase} from '../../feed-details.component';

@Component({
  selector: 'kOperaDestinationForm',
  templateUrl: './opera-destination-form.component.html',
  styleUrls: ['./opera-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: OperaDestinationFormComponent}]
})
export class OperaDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {

  @Output()
  onFormStateChanged = new EventEmitter<{ isValid: boolean, isDirty: boolean }>();

  constructor() {
    super();
  }

  ngOnInit() {
    this.onFormStateChanged.emit({
      isValid: true,
      isDirty: false
    });
  }

  ngOnDestroy() {
  }

  public getData(): KalturaOperaSyndicationFeed {
    return new KalturaOperaSyndicationFeed();
  }
}
