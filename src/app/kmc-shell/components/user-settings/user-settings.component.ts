import { Component } from '@angular/core';
import { KMCBrowserService } from '@kaltura/kmcng-shell';
import { KMCConsts } from '../../../shared/@kmc/core/kmc-consts';
import { KMCLanguage, AppConfig, AppAuthentication, AppUser } from '@kaltura/kmcng-core';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'kmc-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  isOpen: boolean = false;
  timeoutID: number = null;
  private _userContext: AppUser;

  constructor(private userAuthentication: AppAuthentication, private browserService: KMCBrowserService, private appConfig: AppConfig, private lang: KMCLanguage) {
    this._userContext = userAuthentication.appUser;
  }

  setOpen(open) {
    let _this = this;
    if (open) {
      // give a little threshold to allow the user roll out and back in when trying to click a link
      if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
      }
      this.isOpen = open;
    } else {
      this.timeoutID = setTimeout(function(){
        _this.isOpen = open;
      }, 500);
    }
  }

  logout() {
    this.userAuthentication.logout();
  }

  openUserManual() {
    this.browserService.openLink(this.appConfig.get('core.externalLinks.USER_MANUAL'), {}, '_blank');
  }
  openSupport() {
    // check if this is a paying partner. If so - open support form. If not - redirect to general support. Use MD5 to pass as a parameter.
    let payingCustomer: boolean = this._userContext.partnerInfo.partnerPackage === KMCConsts.PartnerPackages.PARTNER_PACKAGE_PAID;

    let params = {
      'type': Md5.hashStr(payingCustomer.toString()),
      'pid': this._userContext.partnerId
    };

    // TODO [kmc] Open support in a modal window over KMC and not in _blank
    this.browserService.openLink(this.appConfig.get('core.externalLinks.SUPPORT'), params, '_blank');
  }

}
