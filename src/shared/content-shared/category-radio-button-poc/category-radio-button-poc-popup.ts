import { Component } from '@angular/core';

@Component({
  selector: 'kCategoryRadioButtonPOCPopup',
  template: `
    <a (click)="categoriesPopup.open()">Test RadioButton categories tree</a>

    <kPopupWidget #categoriesPopup [popupWidth]="560" [popupHeight]="586" [closeBtn]="true" [modal]="true">
      <ng-template>
        <kCategoryRadioButtonPOC></kCategoryRadioButtonPOC>
      </ng-template>
    </kPopupWidget>
  `
})
export class CategoryRadioButtonPocPopupComponent {
}
