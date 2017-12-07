import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { RoleService } from './role.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { Observer } from 'rxjs/Observer';

@Component({
  selector: 'kEditRole',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss'],
  providers: [RoleService]
})
export class EditRoleComponent implements OnInit, OnDestroy {
  @Input() role: KalturaUserRole;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() duplicatedRole: boolean;
  @Output() onRoleSaved = new EventEmitter<void>();

  public _editRoleForm: FormGroup;
  public _editMode: 'edit' | 'new' = 'edit';
  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  constructor(private _fb: FormBuilder,
              private _roleService: RoleService,
              private _appLocalization: AppLocalization) {
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
    this._editRoleForm = this._fb.group({
      name: [this.role ? this.role.name : '', Validators.required],
      description: [this.role ? this.role.description : '', Validators.required],
    });
  }

  private _markFormFieldsAsTouched() {
    this._editRoleForm.markAsUntouched();
    this._editRoleForm.updateValueAndValidity();
  }

  private _getObserver(retryFn: () => void): Observer<void> {
    return <Observer<void>>{
      next: () => {
        this.parentPopupWidget.close();
        this.onRoleSaved.emit();
      },
      error: (error) => {
        this._blockerMessage = new AreaBlockerMessage(
          {
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => retryFn()
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          }
        );
      },
      complete: () => {
        // empty by design
      }
    }
  }

  public _updateRole(): void {
    if (!this._editRoleForm.valid) {
      this._markFormFieldsAsTouched();
      return;
    }

    // no need to reload the table since the duplicated role remained intact
    if (this.duplicatedRole && this._editRoleForm.pristine) {
      this.parentPopupWidget.close();
      return;
    }

    this._blockerMessage = null;

    const editedRole = new KalturaUserRole({
      name: this._editRoleForm.get('name').value,
      description: this._editRoleForm.get('description').value
    });

    this._roleService.updateRole(this.role.id, editedRole)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(this._getObserver(this._updateRole.bind(this)));
  }


  public _addRole(): void {
    if (!this._editRoleForm.valid) {
      this._markFormFieldsAsTouched();
      return;
    }
    this._blockerMessage = null;

    const { name, description } = this._editRoleForm.value;
    this.role = new KalturaUserRole({ name, description });

    this._roleService.addRole(this.role)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(this._getObserver(this._addRole.bind(this)));
  }
}
