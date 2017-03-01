import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { EntryStore, EntrySectionTypes } from '../entry-store/entry-store.service';
import { Section } from "./Section";




@Component({
  selector: 'kEntrySectionsList',
  templateUrl: './entry-sections-list.component.html',
  styleUrls: ['./entry-sections-list.component.scss']
})
export class EntrySectionsList implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;
    public _sections : Section[] = [];
	private _entrySections : Section[] = [];

	private _currentSection : Section;

    constructor(private _appLocalization: AppLocalization, public _entryStore : EntryStore)  {
	    this._entrySections = [
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.metadata'),
			    enabled : true,
			    hasError : false,
			    active: true,
			    sectionType : EntrySectionTypes.Metadata
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.thumbnails'),
			    enabled : true,
			    hasError : false,
			    sectionType : EntrySectionTypes.Thumbnails
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.accessControl'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.AccessControl
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.scheduling'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.Scheduling
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.flavours'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.Flavours
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.captions'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.Captions
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.live'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.Live
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.relatedFiles'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.Related
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.clips'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.Clips
		    },
		    {
			    label : this._appLocalization.get('applications.content.entryDetails.sections.users'),
			    enabled : true,
			    hasError : true,
			    sectionType : EntrySectionTypes.Users
		    }
	    ];
	    this._currentSection = this._entrySections[0];
    }


    /**
     * Update relevant sections for selected entry.
     * @private
     */
    private _reloadSections()
    {
        this._sections = this._entrySections.filter(section => section.enabled);
    }

    public navigateToSection(section : Section) : void
    {
	    this._currentSection.active = false;
	    this._currentSection = section;
	    this._currentSection.active = true;
    	this._entryStore.showSection(section.sectionType);
    }


    ngOnInit() {
        this._reloadSections();
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

