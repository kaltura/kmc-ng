import {AppEvent} from '../app-event';

export class CategoriesGraphUpdatedEvent extends AppEvent {
    constructor() {
        super('CategoriesGraphUpdatedEvent');
    }
}
