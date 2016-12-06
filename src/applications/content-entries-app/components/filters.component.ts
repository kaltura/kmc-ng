import { EventEmitter, Output, Input, Component, OnInit, OnDestroy, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';

import { ContentEntriesStore, FilterArgs, SortDirection } from 'kmc-content-ui/providers/content-entries-store.service';
import {FiltersContent} from './filters-content'


export interface Entry {
    id: string;
    name: string;
    thumbnailUrl: string;
    mediaType: string;
    plays: string;
    createdAt: string;
    duration: string;
    status: string;
}

@Component({
    selector: 'kmc-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit, OnDestroy {

    additionalForm : FormGroup;
    categoriesForm : FormGroup;

    @Output()
    categoriesChanged = new EventEmitter<any>();

    @Output()
    additionalInfoChanged = new EventEmitter<any>();

    lists : any = {};

    constructor(private formBuilder: FormBuilder,
                public contentEntriesStore : ContentEntriesStore) {
        this.categoriesForm = this.formBuilder.group({
            categoriesIdsMatchOr : [],
            createdAtLessThanOrEqual : [],
            createdAtGreaterThanOrEqual : []
        })

        this.additionalForm = this.formBuilder.group({
            mediaTypeIn : [],
            statusIn : [],
            distributionProfiles : []
        });

        // load lists from external json
        for(const propertyName in FiltersContent)
        {
            const propertyItems = FiltersContent[propertyName];
            const propertyTarget = this.lists[propertyName] = [];
            for(const key in propertyItems )
            {
                propertyTarget.push({ label : key, value : propertyItems[key]});
            }
        }
    }

    subscribeToChanges()
    {
        this.categoriesForm.valueChanges.debounceTime(500).subscribe(
            value =>{
               this.categoriesChanged.emit(this.categoriesForm.value);
            });

        this.additionalForm.valueChanges.debounceTime(500).subscribe(
            value =>{
               this.additionalInfoChanged.emit(this.additionalForm.value);
            });
    }

    ngOnInit(){
        this.subscribeToChanges();
    }

    ngOnDestroy(){

    }
}

