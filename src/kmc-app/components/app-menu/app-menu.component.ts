import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppAuthentication, AppUser, AppNavigator } from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell';
import { serverConfig } from 'config/server';

import { kmcAppConfig, KMCAppMenuItem } from '../../kmc-app-config';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
    selector: 'kKMCAppMenu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit, OnDestroy{

    @ViewChild('helpmenu') private _helpmenu: PopupWidgetComponent;

    private sub: any;
    public _userContext: AppUser;
    public _showChangelog = false;
    public _helpMenuOpened = false;

    menuConfig: KMCAppMenuItem[];
    selectedMenuItem: KMCAppMenuItem;
    showSubMenu: boolean = true;


    constructor(private userAuthentication: AppAuthentication,
                private appNavigator: AppNavigator,
                private router: Router,
                private _browserService: BrowserService) {

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
        const item = this.menuConfig.find(({ routePath }) => routePath === path.split('/')[1]);
        if (item) {
            this.selectedMenuItem = item;
            this.showSubMenu = item.showSubMenu !== undefined ? item.showSubMenu : true;
        }
    }

    openHelpLink(key) {
        let link = '';
        switch (key){
            case 'manual':
                link = serverConfig.externalLinks.kaltura.userManual;
                break;
            case 'kmcOverview':
                link = serverConfig.externalLinks.kaltura.kmcOverview;
                break;
            case 'mediaManagement':
                link = serverConfig.externalLinks.kaltura.mediaManagement;
                break;
        }
        if (link.length > 0) {
            this._browserService.openLink(link, {}, '_blank');
        }
        this._helpmenu.close();
    }

    openSupport() {
        this._browserService.openEmail(serverConfig.externalLinks.kaltura.support);
        this._helpmenu.close();
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
