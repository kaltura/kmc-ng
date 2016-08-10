import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';

@Component({
  selector: 'kmc-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss'],
  directives: [ROUTER_DIRECTIVES]
})
export class EntriesComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
  }

}
