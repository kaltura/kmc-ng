import { Component, OnInit } from '@angular/core';

import { AppAuthentication, AppNavigator, AppConfig } from '@kaltura-ng2/kaltura-common';
import { BrowserService } from 'kmcng-shell';

@Component({
  selector: 'kmc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMessage : string;
  inProgress = false;
  showLogin = false;

  constructor(private appAuthentication : AppAuthentication, private appNavigator: AppNavigator, private browserService: BrowserService, private appConfig: AppConfig) {

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


    this.appAuthentication.login(username, password).subscribe(
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
    this.browserService.openLink(this.appConfig.get('core.externalLinks.USER_MANUAL'), {}, '_blank');
  }
}
