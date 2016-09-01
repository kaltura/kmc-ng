import { Component, OnInit,AfterViewInit,ViewChild, OnDestroy } from '@angular/core';
import {AppMenuComponent} from "../app-menu/app-menu.component";
import { AppMenuService } from '../../shared/app-menu.service';
import { KMCShellService } from "../../../shared/kmc-shell.service";
import * as $ from 'jquery';

@Component({
  selector: 'kmc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers : [AppMenuService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('appMenu',true) private _appMenuRef : any;
  private onResize : () => void;

  constructor(private kmcShellService : KMCShellService) {
    this.onResize = this._resizeContent.bind(this);
  }

  private _resizeContent() : void
  {
    const $window = $(window);
    const $appMenu = $(this._appMenuRef.nativeElement);
    this.kmcShellService.setContentAreaHeight($window.outerHeight()-$appMenu.outerHeight());
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
