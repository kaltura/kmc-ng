import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { AppAuthentication, AppShellService, BrowserService, PartnerPackageTypes } from "app-shared/kmc-shell";

import * as $ from 'jquery';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kKMCDashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appMenu') private _appMenuRef : any;
  @ViewChild('whatsNew') private _whatsNewWin : PopupWidgetComponent;
  private onResize : () => void;


  constructor(private appShellService : AppShellService, private appAuthentication: AppAuthentication, private _browserService: BrowserService) {
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
      // const isRegisteredUser = this.appAuthentication.appUser.partnerInfo.partnerPackage !== PartnerPackageTypes.PartnerPackageFree;
      // const whatsNewShown = this._browserService.getFromLocalStorage('whatsNewShown') || false;
      // if (isRegisteredUser && !whatsNewShown){
      //     setTimeout(()=>{
      //         this._browserService.setInLocalStorage('whatsNewShown',true);
      //         this._whatsNewWin.open();
      //     },200);
      // }
  }

  ngAfterViewInit()
  {
    $(window).bind('resize', this.onResize); // We bind the event to a function reference that proxy 'actual' this inside
    this._resizeContent();
    this._showWhatsNew();
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    $(window).unbind('resize',this.onResize);
  }

}
