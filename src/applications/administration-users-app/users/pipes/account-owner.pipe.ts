import { Pipe, PipeTransform } from '@angular/core';
import { KalturaUser } from 'kaltura-ngx-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Pipe({ name: 'accountOwner' })
export class AccountOwnerPipe implements PipeTransform {
  constructor(private _appAuthentication: AppAuthentication, private _appLocalization: AppLocalization) {
  }

  transform(user: KalturaUser): string {
    let userAdditionalData = '';

    if (this._appAuthentication.appUser.id === user.id) {
      userAdditionalData = `${this._appLocalization.get('applications.administration.users.you')}`;
    } else if (user.isAccountOwner) {
      userAdditionalData = `${this._appLocalization.get('applications.administration.users.accountOwner')}`;
    }
    if (this._appAuthentication.appUser.id === user.id && user.isAccountOwner) {
      userAdditionalData = `${this._appLocalization.get('applications.administration.users.you')}, ${this._appLocalization.get('applications.administration.users.accountOwner')}`;
    }

    return userAdditionalData;
  }
}
