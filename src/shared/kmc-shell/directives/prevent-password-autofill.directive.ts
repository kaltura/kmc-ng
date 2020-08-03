import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appPreventPasswordAutofill]'
})
export class PreventPasswordAutofillDirective {
    constructor(private _el: ElementRef,
                private _renderer: Renderer2) {
        this._renderer.setAttribute(_el.nativeElement, 'autocomplete', 'off');
        this._renderer.setAttribute(_el.nativeElement, 'readonly', 'true');

        setTimeout(() => {
            this._renderer.removeAttribute(_el.nativeElement, 'readonly');
        }, 1000);
    }
}
