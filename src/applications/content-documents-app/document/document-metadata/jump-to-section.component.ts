import { ElementRef, Input, Component } from '@angular/core';


@Component({
    selector: 'k-jump-to-section',
    template : '<ng-content></ng-content>'
})
export class JumpToSection {
    @Input()
    public label : string;

    public get htmlElement() : HTMLElement
    {
        return this._elementRef.nativeElement;
    }

    constructor(private _elementRef : ElementRef)
    {}
}