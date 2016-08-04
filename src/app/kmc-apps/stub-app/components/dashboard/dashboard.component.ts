import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KMCConfig } from '@kmc/core'

@Component({
  moduleId: module.id,
  selector: 'kmc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  path : string;
  constructor(r : ActivatedRoute, kmcConfig : KMCConfig) {
    this.path = r.snapshot.url.map((item) => item.path).join('/');
    this.path = kmcConfig.get('env');
  }

  ngOnInit() {
  }

}
