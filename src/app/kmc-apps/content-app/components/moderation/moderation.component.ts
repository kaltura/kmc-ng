import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';

@Component({
  selector: 'kmc-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
  directives: [ROUTER_DIRECTIVES]
})
export class ModerationComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }

}
