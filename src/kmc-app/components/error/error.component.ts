import { Component } from '@angular/core';

@Component({
  selector: 'kKMCError',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  constructor() {
  }

  eggReady = false;

  private prepareEgg = {
      eye1: false,
      eye2: false,
      ear1: false,
      ear2: false
  }

  public _updateEgg(key: string){
      this.prepareEgg[key]=true;
      this.eggReady = Object.keys(this.prepareEgg).every((key) => { return this.prepareEgg[key] });
  }

  public openLink(link){
      window.open(link, '_blank');
  }
}
