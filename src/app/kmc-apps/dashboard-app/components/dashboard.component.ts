import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppUser, UserAuthentication } from '@kaltura/kmcng-core';

@Component({
  selector: 'kmc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  path : string;
  private _userContext : AppUser;

  constructor(r : ActivatedRoute, private authenticationService : UserAuthentication) {
    this.path = r.snapshot.url.map((item) => item.path).join('/');
    this._userContext = authenticationService.appUser;
  }

  ngOnInit() {
  }

}
