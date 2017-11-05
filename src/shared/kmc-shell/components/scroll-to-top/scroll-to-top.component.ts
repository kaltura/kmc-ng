import { Component, Input, HostListener } from '@angular/core';
import { BrowserService } from '../../providers/browser.service';

@Component({
	selector: 'kScrollToTop',
	templateUrl: './scroll-to-top.component.html',
	styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent{

	@Input() scrollOffset = 0;
	@Input() scrollDuration = 500;

	public _show = false;
	private scrolling = false;

	constructor(private _browserService: BrowserService) {}

	@HostListener("window:scroll", [])
	onWindowScroll() {
		this._show = (window.pageYOffset > this.scrollOffset);
	}

	scrollToTop():void{
		this._browserService.scrollToTop(this.scrollDuration);
	}
}

