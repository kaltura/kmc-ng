import { Component, Input } from '@angular/core';
import { AppMenuItem } from '../../services/app-menu-config';

@Component({
  selector: 'kKMCAppContentMenu',
  templateUrl: './app-menu-content.component.html',
  styleUrls: ['./app-menu-content.component.scss']
})
export class AppMenuContentComponent {
  @Input() menuItems: Array<AppMenuItem> = [];

  @Input()
  set position(value: 'rigth' | 'left') {
    this._items = this.menuItems.filter(({ position }) => position === value);
  }

  public _items: Array<AppMenuItem>;
}
