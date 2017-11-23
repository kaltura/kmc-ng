import {Injectable} from '@angular/core';
import {CategoryWidget} from '../category-widget';

@Injectable()
export class CategoryDetailsWidget extends CategoryWidget {
  constructor() {
    super('categoryDetails');
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }
}
