import { Component, OnInit } from '@angular/core';
import { environment } from 'kmc-app';

import { AppAuthentication, AppNavigator } from '@kaltura-ng2/kaltura-common';
import { BrowserService } from 'kmc-shell';

@Component({
  selector: 'kKMCLogin',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMessage : string;
  inProgress = false;
  showLogin = false;

  constructor(private appAuthentication : AppAuthentication, private appNavigator: AppNavigator, private browserService: BrowserService) {

  }

  ngOnInit() {
    if (this.appAuthentication.isLogged()){
      this.appNavigator.navigateToDefault();
    }else{
      this.showLogin = true;
    }
  }

  login(username, password ,event) {

    event.preventDefault();

    this.errorMessage = '';
    this.inProgress = true;


    this.appAuthentication.login(username, password, {
      privileges : environment.core.kaltura.privileges,
      expiry  : environment.core.kaltura.expiry
    }).subscribe(
        (result) =>
        {
          this.appNavigator.navigateToDefault();
          this.inProgress = false;
        },
        (err) =>{
            this.errorMessage = err.message;
          this.inProgress = false;
        }
    );
  }

  openUserManual() {
    this.browserService.openLink(environment.core.externalLinks.USER_MANUAL, {}, '_blank');
  }
}
