import { Component, Input, OnChanges } from '@angular/core';
import { KMCAppMenuItem } from 'app-shared/kmc-shared/kmc-views';


@Component({
  selector: 'kKMCAppContentMenu',
  templateUrl: './app-menu-content.component.html',
  styleUrls: ['./app-menu-content.component.scss']
})
export class AppMenuContentComponent implements OnChanges {
  @Input()
  menuItems : KMCAppMenuItem[];

  @Input()
  position : 'right' | 'left';

  ngOnChanges() {
    this._items = (this.menuItems || []).filter( item  => (item.position || 'left') === this.position);
  }

  public _items: Array<KMCAppMenuItem>;
}
