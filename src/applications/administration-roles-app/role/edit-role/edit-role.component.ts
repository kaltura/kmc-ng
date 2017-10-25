import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {KalturaUserRole} from "kaltura-typescript-client/types/KalturaUserRole";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";
import {AppLocalization} from "@kaltura-ng/kaltura-common";
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import {RoleService} from "./role.service";
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Component({
  selector: 'kEditRole',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss'],
  providers: [RoleService]
})
export class EditRoleComponent implements OnInit, OnDestroy {

  public editRoleForm: FormGroup;
  @Input() role: KalturaUserRole;
  // private roleUnderEdit: KalturaUserRole;
  public _editMode: 'edit' | 'new' = 'edit';
  public _isBusy = false
  public _blockerMessage: AreaBlockerMessage = null;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() duplicatedRole: boolean;
  @Output() onRoleSaved = new EventEmitter<void>();

  constructor(private _fb: FormBuilder,
              private _roleService: RoleService,
              private appLocalization: AppLocalization) {
  }

  ngOnInit() {
    if (!this.role) {
      this._editMode = 'new';
    }
    this._createForm();
  }

  ngOnDestroy() {

  }

  // Create empty structured form on loading
  private _createForm(): void {

    this.editRoleForm = this._fb.group({
      name: [this.role ? this.role.name : '', Validators.required],
      description: [this.role ? this.role.description : '', Validators.required],
    });

  }

  private markFormFieldsAsTouched() {
    for (let inner in this.editRoleForm.controls) {
      this.editRoleForm.get(inner).markAsTouched();
      this.editRoleForm.get(inner).updateValueAndValidity();
    }
  }

  private updateRole(): void {
    if (!this.editRoleForm.valid) {
      this.markFormFieldsAsTouched();
      return;
    }

    // no need to reload the table since the duplicated role remained intact
    if (this.duplicatedRole && this.editRoleForm.pristine) {
      this.parentPopupWidget.close();
      return;
    }

    this._blockerMessage = null;

    const editedRole = new KalturaUserRole({
      name: this.editRoleForm.get('name').value,
      description: this.editRoleForm.get('description').value
    });

    this._roleService.updateRole(this.role.id, editedRole)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        (role) => {
          this.parentPopupWidget.close();
          this.onRoleSaved.emit();
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this.appLocalization.get('app.common.retry'),
                  action: () => {
                    this.updateRole();
                  }
                },
                {
                  label: this.appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          );
        }
      );
  }


  private addRole(): void {
    if (!this.editRoleForm.valid) {
      this.markFormFieldsAsTouched();
      return;
    }
    this._blockerMessage = null;
    this.role = new KalturaUserRole();
    this.role.name = this.editRoleForm.get('name').value;
    this.role.description = this.editRoleForm.get('description').value;
    this._roleService.addRole(this.role)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this.parentPopupWidget.close();
          this.onRoleSaved.emit();
        },
        error => {
          this.role = null;
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this.appLocalization.get('app.common.retry'),
                  action: () => {
                    this.addRole();
                  }
                },
                {
                  label: this.appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          );
        }
      );
  }
}
