import { Component, Input, OnChanges } from '@angular/core';
import { KMCAppMenuItem, KMCAppSubMenuItem } from '../../kmc-app-config';


@Component({
  selector: 'kKMCAppContentMenu',
  templateUrl: './app-menu-content.component.html',
  styleUrls: ['./app-menu-content.component.scss']
})
export class AppMenuContentComponent implements OnChanges {
  @Input()
  menuItems : KMCAppSubMenuItem[];

  @Input()
  position : 'right' | 'left';

  ngOnChanges() {
    this._items = (this.menuItems || []).filter( item  => (item.position || 'left') === this.position);
  }

  public _items: Array<KMCAppSubMenuItem>;
}
