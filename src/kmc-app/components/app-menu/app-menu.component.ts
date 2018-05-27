import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppAuthentication, AppUser} from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell';
import { serverConfig } from 'config/server';

import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';

import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KMCAppMenuItem, KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

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

    public _userContext: AppUser;
    public _showChangelog = false;
    public _helpMenuOpened = false;
    public _powerUser = false;
    public _userManualLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.userManual;
    public _kmcOverviewLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.kmcOverview;
    public _mediaManagementLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.mediaManagement;
    public _supportLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.support;

    menuConfig: KMCAppMenuItem[];
    leftMenuConfig: KMCAppMenuItem[];
    rightMenuConfig: KMCAppMenuItem[];
    selectedMenuItem: KMCAppMenuItem;
    showSubMenu = true;

    constructor(public _kmcLogs: KmcLoggerConfigurator,
                private userAuthentication: AppAuthentication,
                private _kmcMainViews: KmcMainViewsService,
                private router: Router,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService) {

        router.events
            .cancelOnDestroy(this)
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.setSelectedRoute(event.urlAfterRedirects);
                }
            });
        this._userContext = userAuthentication.appUser;
        this.menuConfig = this._kmcMainViews.getMenu();
        this.leftMenuConfig = this.menuConfig.filter((item: KMCAppMenuItem) => {
            return item.position === 'left';
        });
        this.rightMenuConfig = this.menuConfig.filter((item: KMCAppMenuItem) => {
            return item.position === 'right';
        });
        if (router.navigated) {
            this.setSelectedRoute(router.routerState.snapshot.url);
        }

        this._powerUser = this._browserService.getInitialQueryParam('mode') === 'poweruser';
    }

    ngOnInit() {
    }

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
        this._browserService.openEmail({
            email: serverConfig.externalLinks.kaltura.support,
            title: this._appLocalization.get('app.openMail.supportMailTitle'),
            message: this._appLocalization.get('app.openMail.supportMailMsg')
        });
        this._helpmenu.close();
    }


    ngOnDestroy() {
    }
}
