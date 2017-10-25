import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { SectionWidgetItem, EntrySectionsListHandler } from './entry-sections-list-handler';
import { StickyComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntryFormManager } from '../entry-form-manager';



@Component({
  selector: 'kEntrySectionsList',
  templateUrl: './entry-sections-list.component.html',
  styleUrls: ['./entry-sections-list.component.scss']
})
export class EntrySectionsList implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild('entrySections') private entrySections: StickyComponent;

    public _loading = false;
    public _showList = false;
    public _sections : SectionWidgetItem[] = [];
    private _handler : EntrySectionsListHandler;

    constructor(private _entryFormManager : EntryFormManager, public _entryStore : EntryStore, private _browserService: BrowserService)  {
    }


    public navigateToSection(widget : SectionWidgetItem) : void
    {
	    this._browserService.scrollToTop();
        this._entryStore.openSection(widget.key);
    }


    ngOnInit() {
		this._loading = true;
		this._handler = this._entryFormManager.attachWidget(EntrySectionsListHandler);

        this._handler.sections$
        .cancelOnDestroy(this)
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
        this._entryFormManager.detachWidget(this._handler);        
    }


    ngAfterViewInit() {

    }

}

