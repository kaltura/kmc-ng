import { Component } from '@angular/core';
import { AuthenticationService } from "../../../../shared/@kmc/auth/authentication.service";
import { UserContext } from "../../../../shared/@kmc/auth/user-context";
import { KMCExternalLinks } from "../../../../shared/@kmc/core/kmc-external-links.service";
import { KMCConfig } from "../../../../shared/@kmc/core/kmc-config.service";
import { KMCConsts } from "../../../../shared/@kmc/core/kmc-consts";
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'kmc-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  isOpen:boolean = false;
  timeoutID:number = null;
  private _userContext : UserContext;

  constructor(private authenticationService : AuthenticationService, private externalLinksService: KMCExternalLinks, private kmcConfig: KMCConfig) {
    this._userContext = authenticationService.userContext;
  }

  setOpen(open){
    let _this = this;
    if (open) {
      // give a little threshold to allow the user roll out and back in when trying to click a link
      if (this.timeoutID){
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
      }
      this.isOpen = open;
    }else{
      this.timeoutID = setTimeout(function(){
        _this.isOpen = open;
      },500);
    }
  }

  logout(){
    this.authenticationService.logout();
  }

  openUserManual(){
    this.externalLinksService.openLink(this.kmcConfig.get("core.externalLinks.USER_MANUAL"),{},"_blank");
  }
  openSupport(){
console.log(Md5.hashStr('blah blah blah') );

    // check if this is a paying partner. If so - open support form. If not - redirect to general support. Use MD5 to pass as a parameter.
    let payingCustomer: boolean = this._userContext.partnerInfo.partnerPackage === KMCConsts.PartnerPackages.PARTNER_PACKAGE_PAID;

    let params = {
      "type": Md5.hashStr(payingCustomer.toString()),
      "pid": this._userContext.partnerId
    };

    // TODO [kmc] Open support in a modal window over KMC and not in _blank
    this.externalLinksService.openLink(this.kmcConfig.get("core.externalLinks.SUPPORT"), params, "_blank");
  }

}
