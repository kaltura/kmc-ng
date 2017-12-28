import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppAuthentication, AppUser, AppNavigator } from 'app-shared/kmc-shell';
import { AppMenuConfig } from '../../services/app-menu-config';
import { AppMenuService } from '../../services/app-menu.service';
import { AppMenuItem } from "../../services/app-menu-config";

import * as R from 'ramda';

@Component({
    selector: 'kKMCAppMenu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit, OnDestroy{
    private sub: any;
    public _userContext: AppUser;
    public _showChangelog = false;
    public _helpMenuOpened = false;

    constructor(private userAuthentication: AppAuthentication,
                private appMenuService: AppMenuService,
                private appNavigator: AppNavigator,
                private router: Router) {
        this.sub = router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setSelectedRoute(event.url);
            }
        });
        this._userContext = userAuthentication.appUser;

    }

    ngOnInit() {
    }

    menuConfig: AppMenuConfig;
    selectedMenuItem: AppMenuItem;
    showSubMenu: boolean = true;

    setSelectedRoute(path) {
        this.menuConfig = this.appMenuService.getMenuConfig();
        let item = R.find(R.propEq('routePath', path.split("/")[1]))(this.menuConfig);
        if (item) {
            this.selectedMenuItem = item;
            this.showSubMenu = item.showSubMenu !== undefined ? item.showSubMenu : true;
        }
    }

    navigate(path):void{
        this.router.navigate([path]);
    }

    logout() {
        this.userAuthentication.logout();
        this.appNavigator.navigateToLogout();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
