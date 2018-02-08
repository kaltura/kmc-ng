import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {KalturaRokuSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaRokuSyndicationFeed';
import {DestinationComponentBase} from '../../feed-details.component';

@Component({
  selector: 'kRokuDestinationForm',
  templateUrl: './roku-destination-form.component.html',
  styleUrls: ['./roku-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: RokuDestinationFormComponent}]
})
export class RokuDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {

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

  public getData(): KalturaRokuSyndicationFeed {
    return new KalturaRokuSyndicationFeed();
  }
}
