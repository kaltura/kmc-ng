import { Component, OnInit,AfterViewInit,ViewChild, OnDestroy } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import {AppMenuComponent} from "../app-menu/app-menu.component";
import { AppMenuService } from '../../shared/app-menu.service';
import {KMCBrowserService} from "../../../../shared/@kmc/core/kmc-browser.service";
import * as $ from 'jquery';

@Component({
  selector: 'kmc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers : [AppMenuService,KMCBrowserService],
  directives: [ROUTER_DIRECTIVES,AppMenuComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('appMenu',true) private _appMenuRef : any;
  private onResize : () => void;

  constructor(private kmcBrowserService : KMCBrowserService) {
    this.onResize = this._resizeContent.bind(this);
  }

  private _resizeContent() : void
  {
    const $window = $(window);

    const $appMenu = $(this._appMenuRef.nativeElement);
    this.kmcBrowserService.setContentAreaHeight($window.outerHeight()-$appMenu.outerHeight());
  }

  ngAfterViewInit()
  {
    $(window).bind('resize',this.onResize); // We bind the event to a function reference that proxy 'actual' this inside
    this._resizeContent();
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    $(window).unbind('resize',this.onResize);
  }

}
