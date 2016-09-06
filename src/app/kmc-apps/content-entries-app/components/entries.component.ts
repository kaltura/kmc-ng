import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { KalturaAPIClient } from '@kaltura/kapi';
import { BaseEntryService } from '@kaltura/kapi/dist/base-entry'

//import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap';



@Component({
  selector: 'kmc-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss']
  //directives: [DROPDOWN_DIRECTIVES]
})
export class EntriesComponent implements OnInit {

  private entries$: Observable<any>;
  private searchForm: FormGroup;
  private filter: any;
  private responseProfile: any;

  constructor(private formBuilder: FormBuilder, private kalturaAPIClient : KalturaAPIClient) {
    this.searchForm = this.formBuilder.group({
      'search': ['', Validators.required]
    });
    this.filter = {
      "objectType": "KalturaMediaEntryFilter",
      "mediaTypeIn": "1,2,5,6,201"
    }
    this.responseProfile = {
      "objectType": "KalturaDetachedResponseProfile",
      "type": "1",
      "fields": "id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status"
    }
  }

  ngOnInit() {
    this.entries$ = this.searchForm.controls['search'].valueChanges
      .startWith('')
      .debounceTime(500)
      .switchMap(value =>
          BaseEntryService.list(value, this.filter, this.responseProfile)
              .execute(this.kalturaAPIClient)
              .map(response => response.objects));
  }

  onActionSelected(action, entryID){
    alert("Selected Action: "+action+"\nEntry ID: "+entryID);
  }
}
