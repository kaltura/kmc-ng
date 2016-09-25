import { Component, OnInit } from '@angular/core';

import { AppAuthentication, AppNavigator } from '@kaltura/kmcng-core';

@Component({
  selector: 'kmc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMessage : string;
  inProgress = false;
  showLogin = false;

  constructor(private appAuthentication : AppAuthentication, private appNavigator: AppNavigator) {

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
}
