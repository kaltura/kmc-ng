import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { SectionWidgetItem, EntrySectionsListHandler } from './entry-sections-list-handler';

import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntryFormManager } from '../entry-form-manager';



@Component({
  selector: 'kEntrySectionsList',
  templateUrl: './entry-sections-list.component.html',
  styleUrls: ['./entry-sections-list.component.scss']
})
export class EntrySectionsList implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _showList = false;
    public _sections : SectionWidgetItem[] = [];
    private _handler : EntrySectionsListHandler;

    constructor(private _entryFormManager : EntryFormManager, public _entryStore : EntryStore)  {
    }


    public navigateToSection(widget : SectionWidgetItem) : void
    {
	    window.scrollTo(0,0);
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
			}
		);
	}

    ngOnDestroy() {
        this._entryFormManager.detachWidget(this._handler);        
    }


    ngAfterViewInit() {

    }

}

