import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppAuthentication, AppUser, AppNavigator } from 'app-shared/kmc-shell';


import * as R from 'ramda';
import { kmcAppConfig, KMCAppMenuItem } from '../../kmc-app-config';

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

    menuConfig: KMCAppMenuItem[];
    selectedMenuItem: KMCAppMenuItem;
    showSubMenu: boolean = true;


    constructor(private userAuthentication: AppAuthentication,
                private appNavigator: AppNavigator,
                private router: Router) {
        this.sub = router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setSelectedRoute(event.url);
            }
        });
        this._userContext = userAuthentication.appUser;
        this.menuConfig = kmcAppConfig.menuItems;

        if (router.navigated)
        {
            this.setSelectedRoute(router.routerState.snapshot.url);
        }
    }

    ngOnInit() {
    }

    setSelectedRoute(path) {

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
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
