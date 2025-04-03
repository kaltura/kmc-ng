import {Component, AfterViewInit, ViewChild, OnDestroy, OnInit} from '@angular/core';
import {AppBootstrap, ApplicationType, AppShellService} from 'app-shared/kmc-shell';
import * as $ from 'jquery';
import {serverConfig} from 'config/server';
import {globalConfig} from 'config/global';

@Component({
  selector: 'kKMCDashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('appMenu', { static: true }) private _appMenuRef : any;

  private onResize : () => void;

  constructor(private appShellService : AppShellService, private _bootstarpService: AppBootstrap) {
      this.onResize = this._resizeContent.bind(this);
  }

    ngOnInit(): void {
        this._bootstarpService.loadUnisphere();
    }


  private _resizeContent() : void
  {
    const $window = $(window);
    if (this._appMenuRef) {
        const $appMenu = $(this._appMenuRef.nativeElement);
        this.appShellService.setContentAreaHeight($window.outerHeight() - $appMenu.outerHeight());
    }
  }

  ngAfterViewInit()
  {
    $(window).bind('resize', this.onResize); // We bind the event to a function reference that proxy 'actual' this inside
    this._resizeContent();
  }

  ngOnDestroy(){
    $(window).unbind('resize',this.onResize);
  }

}
