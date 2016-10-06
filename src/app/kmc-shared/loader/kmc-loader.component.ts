import { Component, Input } from '@angular/core';

@Component({
  selector: 'kmc-loader',
  templateUrl: './kmc-loader.component.html',
  styleUrls: ['./kmc-loader.component.scss']
})
export class LoaderComponent  {
  @Input() loading: boolean;
  constructor() {

  }

}

