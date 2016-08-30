import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input, ElementRef} from '@angular/core';
import { Subscription } from 'rxjs/rx';
import {KMCBrowserService} from "@kmc/core/kmc-browser.service";
import * as $ from 'jquery';

@Component({
  selector: 'kmc-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.scss']
})
export class AppContainerComponent implements OnInit, OnDestroy, AfterViewInit {

  private _hostedAppPath;
  @ViewChild('iframe',true) private _iframeRef : ElementRef;
  private _$iframe : any;
  private _contentAreaHeightSubscriber : Subscription;

  constructor(private kmcBrowserService : KMCBrowserService) {}

  public get HostedAppPath() : string{
    return this._hostedAppPath;
  }

  @Input('path') public set HostedAppPath(value){
    this._hostedAppPath = value;
    this.changeIframeSrc(value);

  }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.unregisterToHeightChange();
  }

  ngAfterViewInit():any {
    this._$iframe = $(this._iframeRef.nativeElement);
    this.registerToHeightChange();
    this.changeIframeSrc(this._hostedAppPath);
  }

  unregisterToHeightChange() : void{
    if (this._contentAreaHeightSubscriber) {
      this._contentAreaHeightSubscriber.unsubscribe();
    }
  }

  registerToHeightChange() : void{
    const contentArea$ = this.kmcBrowserService.getContentAreaHeight();
    this._contentAreaHeightSubscriber = contentArea$.subscribe(
        value => {
          this._$iframe.height(value);
        });

  }
  changeIframeSrc(value) : void{
    if (this._$iframe) {
      this._$iframe.attr('src', value || 'about:blank');
    }
  }
}
