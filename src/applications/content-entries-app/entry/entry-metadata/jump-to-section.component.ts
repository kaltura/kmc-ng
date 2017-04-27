import { Input, Component } from '@angular/core';


@Component({
    selector: 'k-jump-to-section',
    template : '<ng-content></ng-content>'
})
export class JumpToSection {
    @Input()
    public label : string;
}