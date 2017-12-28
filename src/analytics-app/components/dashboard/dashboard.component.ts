import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { AppShellService } from "app-shared/kmc-shell";

import * as $ from 'jquery';

@Component({
  selector: 'kKMCDashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appMenu',true) private _appMenuRef : any;
  private onResize : () => void;

  constructor(private appShellService : AppShellService) {
    this.onResize = this._resizeContent.bind(this);
  }

  private _resizeContent() : void
  {
    const $window = $(window);
    const $appMenu = $(this._appMenuRef.nativeElement);
    this.appShellService.setContentAreaHeight($window.outerHeight()-$appMenu.outerHeight());
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
