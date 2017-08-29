import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { UsersStore } from '../users-store/users-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

@Component({
	selector: 'kUsersTable',
	templateUrl: './users-table.component.html',
	styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent implements OnInit, OnDestroy {
  public _users: any[] = [];
  private _deferredUsers : any[];
  public _deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public rowTrackBy: Function = (index: number, item: any) => {return item.id};

	constructor(
	  public usersStore: UsersStore
  ) {}

	ngOnInit() {}

	ngOnDestroy() {}
}

