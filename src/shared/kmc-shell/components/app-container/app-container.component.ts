import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input, ElementRef, HostBinding } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { AppShellService } from "../../providers/app-shell.service";
import * as $ from 'jquery';

@Component({
  selector: 'kKMCAppContainer',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.scss']
})
export class AppContainerComponent implements OnInit, OnDestroy, AfterViewInit {

  private _hostedAppPath: string;
  @ViewChild('iframe', { static: true }) private _iframeRef : ElementRef;
  private _contentAreaHeightSubscriber : Subscription;

  constructor(private appShellService : AppShellService) {}

  public get HostedAppPath() : string{
    return this._hostedAppPath;
  }

  @Input('path') public set HostedAppPath(value: string){
    this._hostedAppPath = value;
    this.changeIframeSrc(value);

  }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.unregisterToHeightChange();
  }

  ngAfterViewInit():any {
    this.registerToHeightChange();
    this.changeIframeSrc(this._hostedAppPath);
  }

  unregisterToHeightChange() : void{
    if (this._contentAreaHeightSubscriber) {
      this._contentAreaHeightSubscriber.unsubscribe();
    }
  }

  registerToHeightChange() : void{
    const contentArea$ = this.appShellService.getContentAreaHeight();
    this._contentAreaHeightSubscriber = contentArea$.subscribe(
        value => {
          $(this._iframeRef.nativeElement).height(value);
        });
  }

  changeIframeSrc(value: string) : void{
    if (this._iframeRef) {
      this._iframeRef.nativeElement.src =  value || 'about:blank';
    }
  }
}
