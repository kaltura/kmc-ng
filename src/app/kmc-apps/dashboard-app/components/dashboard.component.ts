import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {AuthenticationService} from "../../../shared/@kmc/auth/authentication.service";
import {UserContext} from "../../../shared/@kmc/auth/user-context";

@Component({
  selector: 'kmc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  path : string;
  private _userContext : UserContext;

  constructor(r : ActivatedRoute, private authenticationService : AuthenticationService) {
    this.path = r.snapshot.url.map((item) => item.path).join('/');
    this._userContext = authenticationService.userContext;
  }

  ngOnInit() {
  }

}
