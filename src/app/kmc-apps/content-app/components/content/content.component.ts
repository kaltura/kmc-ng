import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
  selector: 'kmc-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  directives: [ROUTER_DIRECTIVES]
})
export class ContentComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }

}
