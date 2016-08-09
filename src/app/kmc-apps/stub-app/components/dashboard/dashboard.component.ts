import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kmc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  path : string;
  constructor(r : ActivatedRoute) {
    this.path = r.snapshot.url.map((item) => item.path).join('/');
  }

  ngOnInit() {
  }

}
