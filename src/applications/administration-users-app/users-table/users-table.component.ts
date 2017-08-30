import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { UsersStore } from '../users-store/users-store.service';

@Component({
	selector: 'kUsersTable',
	templateUrl: './users-table.component.html',
	styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent implements OnInit, OnDestroy, AfterViewInit {
  public _users: any[] = [];
  private _deferredUsers : any[];
  public _deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public rowTrackBy: Function = (index: number, item: any) => {return item.id};
  public userFullName: string = '';
  public userRole: string = '';

  @Input() set users(data: any[]) {
    if (!this._deferredLoading) {
      this._users = [];
      this.cdRef.detectChanges();
      this._users = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredUsers = data
    }
  }

	constructor(
	  public usersStore: UsersStore,
    private cdRef: ChangeDetectorRef,
    private _appAuthentication: AppAuthentication,
    private _appLocalization: AppLocalization
  ) {}

	ngOnInit() {
    this.usersStore.users$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          response.items.forEach(user =>
          {
            if(this._appAuthentication.appUser.id === user.id) {
              this.userFullName = `(${this._appLocalization.get('applications.content.users.you')})`;
            } else if (user.isAccountOwner) {
              this.userFullName = `(${this._appLocalization.get('applications.content.users.accountOwner')})`;
            }
            if(this._appAuthentication.appUser.id === user.id && user.isAccountOwner) {
              this.userFullName = `(${this._appLocalization.get('applications.content.users.you')}, ${this._appLocalization.get('applications.content.users.accountOwner')})`;
            }
          });
        }
      );

    this.usersStore.roles$
      .cancelOnDestroy(this)
      .subscribe(
        response => {

        }
      );
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(()=> {
        this._deferredLoading = false;
        this._users = this._deferredUsers;
        this._deferredUsers = null;
      }, 0);
    }
  }

	ngOnDestroy() {}
}

