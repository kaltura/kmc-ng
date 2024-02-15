import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { ManagedTasksProfile } from "../../mr-store/mr-store.service";

@Component({
  selector: 'kDeleteRule',
  templateUrl: './delete-rule.component.html',
  styleUrls: ['./delete-rule.component.scss']
})
export class DeleteRuleComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() profile: ManagedTasksProfile;
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

