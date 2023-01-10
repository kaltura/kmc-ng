import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { AppAuthentication, AppShellService, BrowserService, PartnerPackageTypes } from "app-shared/kmc-shell";
import {buildCDNUrl, buildDeployUrl, serverConfig} from 'config/server';
import * as $ from 'jquery';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { Router } from "@angular/router";

@Component({
  selector: 'kKMCDashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appMenu', { static: true }) private _appMenuRef : any;
  @ViewChild('whatsNew', { static: true }) private _whatsNewWin : PopupWidgetComponent;
  @ViewChild('studioPromo', { static: true }) private _studioPromo : PopupWidgetComponent;

  public _uiconf = serverConfig.kalturaServer.previewUIConfV7;
  public _entryId = '1_rickx95w';
  public _pid = '811441';
  public _cdnUrl = buildCDNUrl("");
  public _studioPlayerReady = false;
  public _studioBannerUrl = buildDeployUrl('./assets/studio.png');
  private onResize : () => void;

  constructor(private appShellService : AppShellService,
              private appAuthentication: AppAuthentication,
              private _browserService: BrowserService,
              private _router: Router) {
      this.onResize = this._resizeContent.bind(this);
  }

  private _resizeContent() : void
  {
    const $window = $(window);
    if (this._appMenuRef) {
        const $appMenu = $(this._appMenuRef.nativeElement);
        this.appShellService.setContentAreaHeight($window.outerHeight() - $appMenu.outerHeight());
    }
  }

  private _showWhatsNew(): void {
      const isSelfserve = this.appAuthentication.appUser.partnerInfo.isSelfServe;
      const whatsNewShown = this._browserService.getFromLocalStorage('getStartedShown') || false;
      if (isSelfserve && !whatsNewShown){
          setTimeout(()=>{
              this._browserService.setInLocalStorage('getStartedShown',true);
              this._whatsNewWin.open();
          },200);
      }
  }
  private _showStudioPromo(): void {
      const isSelfserve = this.appAuthentication.appUser.partnerInfo.isSelfServe;
      const studioPromoShown = this._browserService.getFromLocalStorage('studioPromoShown') || false;
      if (!isSelfserve && !studioPromoShown){
          setTimeout(()=>{
              this._browserService.setInLocalStorage('studioPromoShown',true);
              this._studioPromo.open();
          },200);
      }
  }

  public onStudioPlayerReady(player: any): void {
      player.addEventListener(player.Event.Core.FIRST_PLAY, event => {
          setTimeout(() => {
            this._studioPlayerReady = true;
          },1000);
      });
  }

  public navigateToStudio(): void {
      this._studioPromo.close();
      this._router.navigateByUrl('/studio/v3');
  }

    closeWin():void{
        this._whatsNewWin.close();
    }

  ngAfterViewInit()
  {
    $(window).bind('resize', this.onResize); // We bind the event to a function reference that proxy 'actual' this inside
    this._resizeContent();
    this._showWhatsNew();
    // this._showStudioPromo();
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    $(window).unbind('resize',this.onResize);
  }

}
