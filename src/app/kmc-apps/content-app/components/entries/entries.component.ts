import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';
import { FORM_PROVIDERS, FormBuilder, Validators} from '@angular/common';
import { Observable } from 'rxjs/Observable';

import { BaseEntryService } from "../../../../shared/@kmc/kaltura-api/baseentry.service.ts";
import { EntryTypePipe } from "../../../../shared/@kmc/pipes/entry.type.pipe";
import { EntryStatusPipe } from "../../../../shared/@kmc/pipes/entry.status.pipe";
import { TimePipe } from "../../../../shared/@kmc/pipes/time.pipe";

@Component({
  selector: 'kmc-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss'],
  directives: [ROUTER_DIRECTIVES],
  pipes: [EntryTypePipe, TimePipe, EntryStatusPipe]
})
export class EntriesComponent implements OnInit {


  private entries$: Observable<any>;
  private searchForm: any;

  constructor(private baseEntryService: BaseEntryService, private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      'search': ['', Validators.required]
    });

  }

  ngOnInit() {
    // TODO [kmc] - since we are going to add additional filters, consider using an array variable for binding and update it on each Observable change (search, filter, categories etc.)
    //this.entries$ = this.baseEntryService.list(); // initial load of all entries
    this.entries$ = this.searchForm.controls.search.valueChanges
      .debounceTime(500)
      .switchMap(value => this.baseEntryService.list(value));
  }

  ngAfterViewInit(){
    // initial load of all entries by invoking the search logic with an empty search value. Requires a timeout due to the debounce definition.
    setTimeout(function(self){
      self.searchForm.controls.search.updateValue('');
    },0, this);
  }

}
