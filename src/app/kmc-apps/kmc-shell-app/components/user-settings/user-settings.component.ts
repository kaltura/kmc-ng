import { Component } from '@angular/core';
import { AuthenticationService } from "../../../../shared/@kmc/auth/authentication.service";
import { UserContext } from "../../../../shared/@kmc/auth/user-context";
import { KMCExternalLinks } from "../../../../shared/@kmc/core/kmc-external-links.service";
import {KMCConfig} from "../../../../shared/@kmc/core/kmc-config.service";

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

    // TODO [kmc] use MD5 to encode true / false for paying partner.
    // TODO [kmc] Use hash table of partner packages for package type.
    // TODO [kmc] Open support in a modal window over KMC and not in _blank

    let params = {
      "type": this._userContext.partnerInfo.partnerPackage == 2 ? "b326b5062b2f0e69046810717534cb09" : "68934a3e9455fa72420237eb05902327",
      "pid": this._userContext.partnerId
    };

    this.externalLinksService.openLink(this.kmcConfig.get("core.externalLinks.SUPPORT"), params, "_blank");
  }

}
