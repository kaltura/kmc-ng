import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../../../../shared/@kmc/auth/authentication.service";

@Component({
  moduleId: module.id,
  selector: 'kmc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginResult : any;
  constructor(private authenticationService : AuthenticationService) {}

  ngOnInit() {
  }

  login(event, username, password) {
    event.preventDefault();

    // Temoprary
    this.loginResult = this.authenticationService.login(username, password);
    // this is the relevant approach
    // TODO show loader
    //this.authenticationService.login(username, password).subscribe(
    //    userContext => {
    //
    //    },
    //    err => {
    //
    //    },
    //    () => {
    //      // TODO remove loader
    //    });
  }

}
