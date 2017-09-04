import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KalturaUserRole} from "kaltura-typescript-client/types/KalturaUserRole";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RolesService} from "../../roles/roles.service";
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";
import {AppLocalization} from "@kaltura-ng/kaltura-common";
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";

@Component({
  selector: 'kEditRole',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit, OnDestroy {

  public editRoleForm: FormGroup;
  @Input() role: KalturaUserRole;
  // private roleUnderEdit: KalturaUserRole;
  public _editMode = 'edit';
  public _isBusy = false
  public _blockerMessage: AreaBlockerMessage = null;
  @Input() parentPopupWidget: PopupWidgetComponent;

  constructor(private _fb: FormBuilder,
              private _rolesService: RolesService,
              private appLocalization: AppLocalization) {
  }

  ngOnInit() {
    if (!this.role) {
      this._editMode = 'new';
    }
    // this.roleUnderEdit = Object.assign({}, this.role);
    // }
    this._createForm();
  }

  onSubmit(): void {

  }

  ngOnDestroy() {

  }

  // Create empty structured form on loading
  private _createForm(): void {

    this.editRoleForm = this._fb.group({
      name: [(this.role && this.role.name) || '', Validators.required],
      description: [(this.role && this.role.description) || '', Validators.required],
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
    this._isBusy = true;
    this._blockerMessage = null;
    // const roleUnderEdit = Object.assign({}, this.role);
    this.role.name = this.editRoleForm.get('name').value;
    this.role.description = this.editRoleForm.get('description').value;
    this._rolesService.updateRole(this.role.id, this.role)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._isBusy = false;
          this._rolesService.reload(true);
          this.parentPopupWidget.close();
        },
        error => {
          this._isBusy = false;

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
    this._isBusy = true;
    this._blockerMessage = null;
    // const roleUnderEdit = Object.assign({}, this.role);
    this.role = new KalturaUserRole();
    this.role.name = this.editRoleForm.get('name').value;
    this.role.description = this.editRoleForm.get('description').value;
    this._rolesService.addRole(this.role)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._isBusy = false;
          this._rolesService.reload(true);
          this.parentPopupWidget.close();
        },
        error => {
          this._isBusy = false;

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
}
