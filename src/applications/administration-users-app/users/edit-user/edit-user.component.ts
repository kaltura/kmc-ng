import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';

@Component({
  selector: 'kEditUser',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit, OnDestroy {
  @Input() isBusy: boolean = false;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() popupTitle: string  = '';
  @Input() userForm : FormGroup;
  @Input() selectedRole: string = '';
  @Input() rolesList: SelectItem[] = [];
  @Output() getRoleDescription = new EventEmitter<string>();
  @Output() saveUser = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}
}
