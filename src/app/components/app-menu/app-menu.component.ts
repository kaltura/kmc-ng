import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

import {AppAuthentication, AppUser, AppNavigator} from '@kaltura-ng2/kaltura-common';
import {AppMenuConfig} from '../../services/app-menu-config';
import {AppMenuService} from '../../services/app-menu.service';
import {AppMenuItem} from "../../services/app-menu-config";

import { MenuItem} from 'primeng/primeng';

import * as R from 'ramda';


@Component({
    selector: 'kmc-app-menu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit{

    private sub: any;
    private _userContext: AppUser;
    private userSettingsMenu: MenuItem[];

    constructor(private userAuthentication: AppAuthentication, private appMenuService: AppMenuService, private appNavigator : AppNavigator, private router: Router) {
        this.sub = router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setSelectedRoute(event.url);
            }
        });
        this._userContext = userAuthentication.appUser;

    }

    ngOnInit() {
        this.userSettingsMenu = [
            {label: 'Logout', command: (event) => {
                this.logout();
            }},
            {label: 'Change Account'},
            {label: 'English', items: [
                {label: 'English'},
                {label: 'Deutsch'},
                {label: 'Español'},
                {label: 'Français'},
                {label: '日本語'}
            ]}
        ];
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


    logout() {
        this.userAuthentication.logout();
        this.appNavigator.navigateToLogout();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
