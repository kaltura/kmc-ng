import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client';

@Component({
  selector: 'kCategoriesBulkChangeContributionPolicy',
  templateUrl: './bulk-change-contribution-policy.component.html',
  styleUrls: ['./bulk-change-contribution-policy.component.scss']
})

export class CategoriesBulkChangeContributionPolicy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() changeContributionPolicyChanged = new EventEmitter<KalturaContributionPolicyType>();
  public _selectedPolicy: KalturaContributionPolicyType = null;
  public _availablePolicies = KalturaContributionPolicyType;

  constructor() {
  }

  public _apply() {
    this.changeContributionPolicyChanged.emit(this._selectedPolicy);
    this.parentPopupWidget.close();
  }
}

