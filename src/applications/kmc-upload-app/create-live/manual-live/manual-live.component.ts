import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {KalturaLiveStream, ManualLive} from "../create-live.service";
import {AppLocalization} from "@kaltura-ng/kaltura-common";

@Component({
  selector: 'kManualLive',
  templateUrl: './manual-live.component.html',
  styleUrls: ['./manual-live.component.scss']
})
export class ManualLiveComponent implements OnInit {

  public _form: FormGroup;

  @Input()
  data: ManualLive;

  @Output()
  dataChange = new EventEmitter<KalturaLiveStream>();

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._form = this._fb.group({
      name: [''],
      // phone: ['', [Validators.required, phoneValidator()]],
      // comments: [''],
    });

    this._form.valueChanges.subscribe(data => {
      console.log('Form changes', data)
      this.dataChange.emit(data)
    })
  }

  onSubmit(): void {
    // if (this._form.valid) {
    //   this.dataChange.emit(this._form.value)
    // }
  }

  public validate() {
    return this._form.valid;
  }

}
