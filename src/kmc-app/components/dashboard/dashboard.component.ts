import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { AppAuthentication, AppShellService, BrowserService, PartnerPackageTypes } from "app-shared/kmc-shell";
import {buildCDNUrl, buildDeployUrl, serverConfig} from 'config/server';
import * as $ from 'jquery';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kKMCDashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appMenu', { static: true }) private _appMenuRef : any;
  @ViewChild('whatsNew', { static: true }) private _whatsNewWin : PopupWidgetComponent;

  public _ks = '';
  public _uiconf = serverConfig.kalturaServer.previewUIConfV7;
  public _entryId = '1_alj2q99a'; // TODO [selfServe] - get entry from product
  public _pid = '1645161'; // TODO [selfServe] - get pid from product
  public _cdnUrl = buildCDNUrl("");
  public _showUnmuteBtn = false;
  private onResize : () => void;


  constructor(private appShellService : AppShellService, private appAuthentication: AppAuthentication, private _browserService: BrowserService) {
      this.onResize = this._resizeContent.bind(this);
      this._ks = this.appAuthentication.appUser.ks;
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
      const isVpaasUser = true; // TODO [selfServe] - set logic to show to vpaas only
      const whatsNewShown = this._browserService.getFromLocalStorage('getStartedShown') || false;
      if (isVpaasUser && !whatsNewShown){
          setTimeout(()=>{
              // this._browserService.setInLocalStorage('getStartedShown',true); TODO [selfServe] - uncomment before publish, need to hide after one time
              this._whatsNewWin.open();
          },200);
      }
  }

    closeWin():void{
        this._whatsNewWin.close();
    }

    public unmute(): void {
      if (window['loadedKalturaPlayer']) {
          window['loadedKalturaPlayer'].muted = false;
          this._showUnmuteBtn = false;
      }
    }

  ngAfterViewInit()
  {
    $(window).bind('resize', this.onResize); // We bind the event to a function reference that proxy 'actual' this inside
    this._resizeContent();
    // this._showWhatsNew(); // TODO [selfServe] - uncomment when implementation is ready
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    $(window).unbind('resize',this.onResize);
  }

}
