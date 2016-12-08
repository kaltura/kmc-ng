import { EventEmitter, Output, Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import {FiltersContent} from './filters-content'


export interface RefineFiltersChangedArgs
{
    createdAtFrom? : Date;
    createdAtTo? : Date;
    mediaTypes? : number[];
    statuses? : number[];
    distributionProfiles? : number[];
}

@Component({
    selector: 'kFilters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit, OnDestroy {

    refineForm : FormGroup;
    categoriesForm : FormGroup;

    @Output()
    categoriesChanged = new EventEmitter<number[]>();

    @Output()
    refineFiltersChanged = new EventEmitter<RefineFiltersChangedArgs>();

    lists : any = {};

    constructor(private formBuilder: FormBuilder,
                ) {
        this.categoriesForm = this.formBuilder.group({
            categories : []
        })

        this.refineForm = this.formBuilder.group({
            createdAtFrom : [],
            createdAtTo : [],
            mediaTypes : [],
            statuses : [],
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
                this.categoriesChanged.emit(this.categoriesForm.value.categories.split(','));
            });

        this.refineForm.valueChanges.debounceTime(500).subscribe(
            value =>{
               this.refineFiltersChanged.emit(this.refineForm.value);
            });
    }

    ngOnInit(){
        this.subscribeToChanges();
    }

    ngOnDestroy(){

    }
}

