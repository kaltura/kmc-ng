import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppAuthentication, AppUser, AppNavigator } from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell';
import { serverConfig } from 'config/server';

import * as R from 'ramda';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KMCAppMenuItem, KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views';

@Component({
    selector: 'kKMCAppMenu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss'],
    providers: [
        KalturaLogger.createLogger('AppMenuComponent')
    ]

})
export class AppMenuComponent implements OnInit, OnDestroy{

    @ViewChild('helpmenu') private _helpmenu: PopupWidgetComponent;

    private sub: any;
    public _userContext: AppUser;
    public _showChangelog = false;
    public _helpMenuOpened = false;

    menuConfig: KMCAppMenuItem[];
    selectedMenuItem: KMCAppMenuItem;
    showSubMenu = true;

    constructor(private userAuthentication: AppAuthentication,
                private _kmcMainViews: KmcMainViewsService,
                private _logger: KalturaLogger,
                private router: Router,
                private _browserService: BrowserService) {

        this.sub = router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setSelectedRoute(event.urlAfterRedirects);
            }
        });
        this._userContext = userAuthentication.appUser;
        this.menuConfig = this._kmcMainViews.createMenu();

        if (router.navigated)
        {
            this.setSelectedRoute(router.routerState.snapshot.url);
        }
    }

    ngOnInit() {
    }

    // TODO sakal remove
    setSelectedRoute(path) {
        if (this.menuConfig) {
            this.selectedMenuItem = this.menuConfig.find(item => item.isActiveView(path));
            this.showSubMenu = this.selectedMenuItem && this.selectedMenuItem.children && this.selectedMenuItem.children.length > 0;
        } else {
            this.selectedMenuItem = null;
            this.showSubMenu = false;
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
