import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kReleaseNotes',
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent {

    @Output() onChange = new EventEmitter<boolean>();

    public _showReleaseNotes: boolean = false;
    constructor() {}

    public _toggleReleaseNotes(event){
        this.onChange.emit(event);
    }
}
