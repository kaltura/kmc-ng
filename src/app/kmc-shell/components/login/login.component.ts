import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UserAuthentication } from '@kaltura/kmcng-core';
import {KMCBrowserService} from "../../../shared/@kmc/core/kmc-browser.service";

@Component({
  selector: 'kmc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  sessionKS : string;
  localKS : string;
  errorMessage : string;
  automaticLogin = false;
  inProgress = false;
  userContext : any;
  constructor(private userAuthentication : UserAuthentication, private browserService : KMCBrowserService) {

  }

  ngOnInit() {
    this.updateSessionKS();

    // TODO [kmc] for demonstration purposes - should not reach the login page if already logged-in
    this.inProgress = true;
    this.userAuthentication.loginAutomatically().subscribe(
        (result) =>
        {
          this.userContext = this.userAuthentication.appUser;
          this.automaticLogin = true;
          this.inProgress = false;
        },
        (err) =>{
          this.inProgress = false;
        }
    );
  }


  login(username, password, rememberMe,event) {


    event.preventDefault();


    this.errorMessage = '';
    this.inProgress = true;
    this.automaticLogin = false;


    this.userAuthentication.login(username, password,rememberMe).subscribe(
        (result) =>
        {
          this.userContext = this.userAuthentication.appUser;

          this.inProgress = false;
        },
        (err) =>{
            this.errorMessage = err.message;
            this.userContext = '';
          this.inProgress = false;
        }
    );
  }

  private updateSessionKS():void {
    // TODO [kmc] should remove this function - temporary for demonstration
    this.localKS = this.browserService.getFromLocalStorage('auth.ks');
    this.sessionKS = this.browserService.getFromSessionStorage('auth.ks');
  }


}
