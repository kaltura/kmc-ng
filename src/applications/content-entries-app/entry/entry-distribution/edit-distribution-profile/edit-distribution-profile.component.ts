import { Component, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Component({
  selector: 'kEditDistributionProfile',
  templateUrl: './edit-distribution-profile.component.html',
  styleUrls: ['./edit-distribution-profile.component.scss']
})
export class EditDistributionProfileComponent {
  @Input() parentPopup: PopupWidgetComponent;

  public _addButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.export');

  constructor(private _appLocalization: AppLocalization) {

  }
}

