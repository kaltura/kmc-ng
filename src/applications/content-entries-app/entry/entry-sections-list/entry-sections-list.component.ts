import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { SectionData, EntrySectionsListHandler } from './entry-sections-list-handler';
import { EntrySectionTypes } from '../entry-sections-types';


import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'kEntrySectionsList',
  templateUrl: './entry-sections-list.component.html',
  styleUrls: ['./entry-sections-list.component.scss']
})
export class EntrySectionsList implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;
    public _showSections = false;
    public _sections : SectionData[] = [];

	private _activeSection : EntrySectionTypes = null;

    constructor(public _entryStore : EntryStore, private _sectionHandler : EntrySectionsListHandler)  {
    }


    public navigateToSection(section : SectionData) : void
    {
        this._entryStore.openSection(section.sectionType);
    }


    ngOnInit() {
		this._sectionHandler.sections$.subscribe(
			sections =>
			{
			    this._sections = sections;
			    this._showSections = sections && sections.length > 0;
			}
		);
	}

    ngOnDestroy() {
    }


    ngAfterViewInit() {

    }

    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {
        }
    }
}

