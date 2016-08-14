import { Component } from '@angular/core';
import { AuthenticationService } from "../../../../shared/@kmc/auth/authentication.service";
import { UserContext } from "../../../../shared/@kmc/auth/user-context";

@Component({
  selector: 'kmc-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  isOpen:boolean = false;
  timeoutID:number = null;
  private _userContext : UserContext;

  constructor(private authenticationService : AuthenticationService) {
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

}
