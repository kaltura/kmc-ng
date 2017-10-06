import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import { AppAuthentication } from 'app-shared/kmc-shell';

@Pipe({name: 'fullName'})
export class FullNamePipe implements PipeTransform {
	constructor(
	  private _appLocalization: AppLocalization,
    private _appAuthentication: AppAuthentication
  ) {}

	transform(value: string, user: KalturaUser): string {
		let userAdditionalData: string = '';

    if (typeof value !== 'undefined' && value !== null && user instanceof KalturaUser) {

      if(this._appAuthentication.appUser.id === user.id) {
        userAdditionalData = `(${this._appLocalization.get('applications.administration.users.you')})`;
      } else if (user.isAccountOwner) {
        userAdditionalData = `(${this._appLocalization.get('applications.administration.users.accountOwner')})`;
      }
      if(this._appAuthentication.appUser.id === user.id && user.isAccountOwner) {
        userAdditionalData = `(${this._appLocalization.get('applications.administration.users.you')}, ${this._appLocalization.get('applications.administration.users.accountOwner')})`;
      }
    }
		return `${user.fullName} ${userAdditionalData}`;
	}
}
