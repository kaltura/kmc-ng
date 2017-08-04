import { Component, OnInit } from '@angular/core';
import { environment } from 'app-environment';

import { AppAuthentication, AppNavigator } from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kKMCLogin',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string;
  errorMessage: string;
  inProgress = false;
  showLogin = false;

  constructor(private appAuthentication: AppAuthentication, private appNavigator: AppNavigator, private browserService: BrowserService) {

  }

  ngOnInit() {
    if (this.appAuthentication.isLogged()) {
      this.appNavigator.navigateToDefault();
    } else {
      this.showLogin = true;
      this.username = this.browserService.getFromLocalStorage('login.username');
    }
  }

  login({ username, password }) {
    this.errorMessage = '';
    this.inProgress = true;

    this.appAuthentication.login(username, password, {
      privileges: environment.core.kaltura.privileges,
      expiry: environment.core.kaltura.expiry
    }).subscribe(
      (result) => {
        this.appNavigator.navigateToDefault();
        this.inProgress = false;
      },
      (err) => {
        this.errorMessage = err.message;
        this.inProgress = false;
      }
    );
  }

  rememberMe(username: string) {
    if (username) {
      this.browserService.setInLocalStorage('login.username', username);
    } else {
      this.browserService.removeFromLocalStorage('login.username');
    }
  }

  openUserManual() {
    this.browserService.openLink(environment.core.externalLinks.USER_MANUAL, {}, '_blank');
  }
}
