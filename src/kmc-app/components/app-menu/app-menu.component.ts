import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppAuthentication, AppUser} from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell';
import { serverConfig } from 'config/server';

import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';

import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KMCAppMenuItem, KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views';
import { ContextualHelpLink, ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';
import { globalConfig } from 'config/global';

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
    private _appCachedVersionToken = 'kmc-cached-app-version';

    public _showChangelog = false;
    public _helpMenuOpened = false;
    public _powerUser = false;
    public _userManualLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.userManual;
    public _kmcOverviewLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.kmcOverview;
    public _mediaManagementLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.mediaManagement;
    public _supportLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.support;
    public _contextualHelp: ContextualHelpLink[] = [];

    menuConfig: KMCAppMenuItem[];
    leftMenuConfig: KMCAppMenuItem[];
    rightMenuConfig: KMCAppMenuItem[];
    selectedMenuItem: KMCAppMenuItem;
    showSubMenu = true;

    constructor(public _kmcLogs: KmcLoggerConfigurator,
                private _contextualHelpService: ContextualHelpService,
                public _userAuthentication: AppAuthentication,
                private _kmcMainViews: KmcMainViewsService,
                private router: Router,
                private _browserService: BrowserService) {

        _contextualHelpService.contextualHelpData$
            .cancelOnDestroy(this)
            .subscribe(data => {
                this._contextualHelp = data;
            });

        router.events
            .cancelOnDestroy(this)
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.setSelectedRoute(event.urlAfterRedirects);
                }
            });
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
        const cachedVersion = this._browserService.getFromLocalStorage(this._appCachedVersionToken);
        this._showChangelog = cachedVersion !== globalConfig.client.appVersion;
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
        this._browserService.openSupport();
        this._helpmenu.close();
    }


    ngOnDestroy() {
    }

    public _changelogPopupOpened(): void {
        this._showChangelog = false;
        this._browserService.setInLocalStorage(this._appCachedVersionToken, globalConfig.client.appVersion);
    }
}
