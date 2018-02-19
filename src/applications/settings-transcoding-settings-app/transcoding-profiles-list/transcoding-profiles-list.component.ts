import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'k-transcoding-profiles-list',
  templateUrl: './transcoding-profiles-list.component.html',
  styleUrls: ['./transcoding-profiles-list.component.scss']
})
export class TranscodingProfilesListComponent implements OnInit {
  @Input() title = '';

  constructor() { }

  ngOnInit() {
  }

}
