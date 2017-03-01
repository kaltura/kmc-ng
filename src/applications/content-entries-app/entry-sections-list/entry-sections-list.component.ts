import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { EntryStore, EntrySectionTypes } from '../entry-store/entry-store.service';
import { Section } from "./Section";

const entrySections : Section[] = [
    {
        label : 'Metadata',
        enabled : true,
        hasError : false,
        sectionType : EntrySectionTypes.Metadata
    },
    {
        label : 'Users',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Users
    },
    {
        label : 'Thumbnails',
        enabled : false,
        hasError : false,
        sectionType : EntrySectionTypes.Thumbnails
    }

];


@Component({
  selector: 'kEntrySectionsList',
  templateUrl: './entry-sections-list.component.html',
  styleUrls: ['./entry-sections-list.component.scss']
})
export class EntrySectionsList implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;
    public _sections : Section[] = [];

    constructor(private _appLocalization: AppLocalization, public _entryStore : EntryStore)  {

    }


    /**
     * Update relevant sections for selected entry.
     * @private
     */
    private _reloadSections()
    {
        this._sections = entrySections.filter(section => section.enabled);
    }

    public navigateToSection(section : Section) : void
    {
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

