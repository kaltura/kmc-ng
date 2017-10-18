import { Component, Input, OnInit } from '@angular/core';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';

@Component({
  selector: 'k-statuses-tree',
  templateUrl: './statuses-tree.component.html',
  styleUrls: ['./statuses-tree.component.scss']
})
export class StatusesTreeComponent implements OnInit {
  @Input() selection: PrimeTreeNode[];

  constructor() {}

  ngOnInit() {}
}

