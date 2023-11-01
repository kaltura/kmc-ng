import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AuthProfile } from "../profiles-store/profiles-store.service";

@Component({
  selector: 'kDeleteProfile',
  templateUrl: './delete-profile.component.html',
  styleUrls: ['./delete-profile.component.scss']
})
export class DeleteProfileComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() profile: AuthProfile;
  @Output() onDelete = new EventEmitter<void>();

  public _profileName = '';

  constructor(private _appLocalization: AppLocalization) {
  }

  public delete(): void {
      this.onDelete.emit();
      this.parentPopupWidget.close();
  }

  ngOnInit() {
      this._profileName = '';
  }

}

