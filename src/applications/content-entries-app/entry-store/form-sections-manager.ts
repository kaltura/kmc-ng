import {  Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntryDataSection } from './entry-data-section';
import { EntryStore } from './entry-store.service';
import { EntryLoading, EntryLoaded, SectionEntered } from './entry-sections-events';
import { FormSectionHandler } from './form-section-handler';
import { EntrySectionTypes } from './entry-sections-types';


@Injectable()
export class FormSectionsManager implements OnDestroy
{

    private _isFirstLoad : boolean = true;
    private _sections : FormSectionHandler[] = [];
    private _activeSection : BehaviorSubject<FormSectionHandler> = new BehaviorSubject<FormSectionHandler>(null);
    public activeSection$  = this._activeSection.monitor('active section');

    public registerSection(section : FormSectionHandler)
    {
        this._sections.push(section);
    }

    constructor()
    {

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


    // validate() : Observable<EntrySectionValidation>
    // {
    //
    // }
    // sectionStatus$ : Observable<{ section :EntrySectionTypes, isValid : boolean}>;
    // canLeaveSection() : Observable<boolean>;
    //
    public get sections() : EntryDataSection[]
    {
        return [...this._sections];
    }

    public canSaveData() : Observable<boolean>
    {
        return Observable.of(true);


        // const activeSection = this._getActiveSection();

        //
        // if (activeSection) {
        //
        //     activeSection.canLeaveSection()
        //         .flatMap(result =>
        //         {
        //             if (result)
        //             {
        //                 return Observable.forkJoin(...this.sections.map(section =>
        //                 {
        //                     return section.validate()
        //                         .monitor('validate section');
        //                 })).map(responses =>
        //                 {
        //                     return responses.find(section => !section.isValid) === null;
        //                 });
        //             }else
        //             {
        //                 return Observable.of(false);
        //             }
        //
        //         })
        //         .subscribe(
        //             (response) => {
        //
        //                 if (response) {
        //                     this._events.next(new EntrySaved());
        //                 }else {
        //                     this._events.next(new EntrySavingFailure(null));
        //                 }
        //             },
        //             error => {
        //                 this._events.next(new EntrySavingFailure(error));
        //             }
        //         )
        // }else {
        //     this._events.next(new EntrySavingFailure(new Error('Failed to extract active section')));
        // }
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

    }
}
