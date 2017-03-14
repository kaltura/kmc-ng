import {  Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntryStore } from './entry-store.service';
import { EntryLoading, EntryLoaded, SectionEntered } from './entry-sections-events';
import { FormSectionHandler } from './form-section-handler';
import { EntrySectionTypes } from './entry-sections-types';

export declare type SectionsStatus = {
    [key : number] : { isValid : boolean }
}

@Injectable()
export class FormSectionsManager implements OnDestroy
{

    private _isFirstLoad : boolean = true;
    private _sections : FormSectionHandler[] = [];
    private _activeSection : BehaviorSubject<FormSectionHandler> = new BehaviorSubject<FormSectionHandler>(null);
    public activeSection$  = this._activeSection.monitor('active section');
    private _sectionsStatus : BehaviorSubject<SectionsStatus> = new BehaviorSubject<SectionsStatus>({});
    public sectionsStatus$  = this._sectionsStatus.monitor('section status');

    public registerSection(section : FormSectionHandler)
    {
        this._sections.push(section);
    }

    constructor()
    {

    }

    public notifySectionStatus(section : FormSectionHandler, status : {isValid : boolean}) : void {
        let sectionsStatus = this._sectionsStatus.getValue() || {};
        let sectionStatus = sectionsStatus[section.sectionType];

        if (!sectionStatus || (sectionStatus && sectionStatus.isValid !== status.isValid)) {
            sectionsStatus[section.sectionType] = status;
            this._sectionsStatus.next(sectionsStatus);
        }
    }

    public setStore(store : EntryStore) : void
    {
        store.events$
            .cancelOnDestroy(this)
            .subscribe(
                event => {
                    if (event instanceof EntryLoading) {

                        if (this._isFirstLoad)
                        {
                            this._isFirstLoad = false;
                            this._sections.forEach(section =>
                            {
                                section.initialize();
                            });
                        }else {
                            this._sections.forEach(section => {
                                section.resetSectionState();
                            });
                        }

                        this._sections.forEach(section => {
                            section.onDataLoading(event.entryId);
                        });
                    } else if (event instanceof EntryLoaded)
                    {
                        this._sections.forEach(section => {
                            section.onDataLoaded(event.entry);
                        });
                    }
                    else if (event instanceof SectionEntered) {
                        if (this._activeSection.getValue())
                        {
                            this._activeSection.getValue().deactivate();
                        }

                        const newActiveSection = this.findSectionByType(event.to);

                        if (newActiveSection)
                        {
                            this._activeSection.next(newActiveSection);
                            newActiveSection.activate();
                        }
                    }
                }
            );
    }

    public get sections() : FormSectionHandler[]
    {
        return [...this._sections];
    }

    public canSaveData() : Observable<boolean>
    {
        const activeSection = this._activeSection.getValue();

        if (activeSection) {
            return activeSection.canLeaveSection()
                .flatMap(result =>
                {
                    if (result)
                    {
                        return Observable.forkJoin(...this.sections.map(section =>
                        {
                            return section.validate()
                                .monitor(`validate section ${section.sectionType}`);

                        })).map(responses =>
                        {
                            const invalidResponse = responses.find(response => !response.isValid) || null;

                            return invalidResponse === null;
                        });
                    }else
                    {
                        return Observable.of(false);
                    }

                })
        }else {
            return Observable.of(false);
        }
    }

    public findSectionByType(sectionType : EntrySectionTypes) : FormSectionHandler
    {
        return this._sections.find(section => section.sectionType === sectionType);
    }

    public isActiveSection(section : FormSectionHandler)
    {
        return this._activeSection.getValue() === section;
    }

    ngOnDestroy()
    {
        this._activeSection.complete();
        this._sectionsStatus.complete();
    }
}
