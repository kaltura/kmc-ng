import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES,Router } from '@angular/router';

import { AppMenuConfig } from '../../shared/app-menu-config';
import { AppMenuService } from '../../shared/app-menu.service';

@Component({
  moduleId: module.id,
  selector: 'kmc-app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss'],
  directives: [ROUTER_DIRECTIVES]
})
export class AppMenuComponent implements OnInit {

  constructor(private appMenuService : AppMenuService,private router : Router) {

  }

  menuConfig : AppMenuConfig;

  selectItem(item) : void{
    // The navigation is done by url since the menu config is not aware to the internal hierarchy
    this.router.navigateByUrl(item.routePath);
  }
  notifyMenuLoadError(reason : any) : void {
    console.error(reason);
  }
  useMenuConfig(menuConfig : AppMenuConfig) :void {
    this.menuConfig = menuConfig;
  }
  ngOnInit() {
    this.appMenuService.getMenuConfig().then(this.useMenuConfig.bind(this)).catch(this.notifyMenuLoadError.bind(this));
  }

}
