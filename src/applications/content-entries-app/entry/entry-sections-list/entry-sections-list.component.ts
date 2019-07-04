import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { StickyComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { EntrySectionsListWidget, SectionWidgetItem } from './entry-sections-list-widget.service';



@Component({
  selector: 'kEntrySectionsList',
  templateUrl: './entry-sections-list.component.html',
  styleUrls: ['./entry-sections-list.component.scss']
})
export class EntrySectionsList implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild('entrySections', { static: false }) private entrySections: StickyComponent;

    public _loading = false;
    public _showList = false;
    public _sections : SectionWidgetItem[] = [];


    constructor(public _widgetService : EntrySectionsListWidget, public _entryStore : EntryStore, private _browserService: BrowserService)  {
    }


    public navigateToSection(widget : SectionWidgetItem) : void
    {
	    this._browserService.scrollToTop();
        this._entryStore.openSection(widget.key);
    }


    ngOnInit() {
		this._loading = true;
		this._widgetService.attachForm();

        this._widgetService.sections$
        .pipe(cancelOnDestroy(this))
        .subscribe(
			sections =>
			{
				this._loading = false;
			    this._sections = sections;
			    this._showList = sections && sections.length > 0;
			    this.entrySections.updateLayout();
			}
		);
	}

    ngOnDestroy() {
        this._widgetService.detachForm();
    }


    ngAfterViewInit() {

    }

}

