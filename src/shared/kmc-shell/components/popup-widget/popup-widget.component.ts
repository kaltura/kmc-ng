import { Component, AfterViewInit, EventEmitter, OnDestroy, Input, ElementRef} from '@angular/core';
import {BrowserService} from "../../providers/browser.service";
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'kPopupWidget',
    templateUrl: './popup-widget.component.html',
    styleUrls: ['./popup-widget.component.scss']
})
export class PopupWidgetComponent implements AfterViewInit, OnDestroy{

    stateNotifier: Subject<any> = new Subject();

    // required parameters
    @Input() popupWidth: number;
    @Input() popupHeight: number;
    @Input() targetRef: any;

    // optional parameters
    @Input() modal: boolean = false;
    @Input() closeBtn: boolean = true;
    @Input() closeOnClickOutside: boolean = true;
    @Input() targetOffset: any = {'x':0, 'y': 0};
    @Input() childrenPopups: PopupWidgetComponent[] = [];
    @Input() parentPopup: PopupWidgetComponent;

    // events
    onOpen = new EventEmitter<any>();
    onViewInit = new EventEmitter<any>();
    onClose = new EventEmitter<any>();

    constructor(public popup: ElementRef, public browserService: BrowserService) {
    }

    show: boolean = false;
    enabled: boolean = false;

    modalOverlay: any;

    // public API methods
    open(){
        if (this.enabled) {
            // set location according to targetRef
            this.popup.nativeElement.style.marginLeft = this.targetRef.getBoundingClientRect().left + this.targetOffset['x'] + 'px';
            this.popup.nativeElement.style.marginTop = this.targetRef.getBoundingClientRect().top + this.targetOffset['y'] + 'px';
            this.popup.nativeElement.style.zIndex = this.browserService.getPopupZindex();

            // handle modal
            if (this.modal && document.getElementsByClassName('modalOverlay').length === 0) {
                this.modalOverlay = document.createElement('div');
                this.modalOverlay.className = 'modalOverlay';
                this.modalOverlay.style.zIndex = this.popup.nativeElement.style.zIndex - 1;
                document.body.appendChild(this.modalOverlay);
            }

            this.show = true;
            this.onOpen.emit(); // dispatch onOpen event (API)
            this.stateNotifier.next('open');
        }
    }

    close(){
        if (this.enabled) {
            this.show = false;
            this.onClose.emit(); // dispatch onClose event (API)
            this.stateNotifier.next('close');

            // close children popups if exist
            if (this.childrenPopups.length){
                this.childrenPopups.forEach((popup:PopupWidgetComponent) => {
                    popup.close();
                });
            }

            // handle modal
            if (this.modal && document.getElementsByClassName('modalOverlay').length > 0) {
                document.body.removeChild(this.modalOverlay);
            }
        }
    }

    toggle(){
        if (this.enabled) {
            this.show ? this.close() : this.open();
        }
    }

    // component lifecycle events
    ngAfterViewInit() {
        if (this.validate()) {
            this.enabled = true;
            this.onViewInit.emit(); // dispatch onViewInit event (API)
            this.stateNotifier.next('viewInit');

            document.body.appendChild(this.popup.nativeElement); // attach component to body to get absolute position

            // register to targetRef click event to toggle the popup widget
            this.targetRef.addEventListener('click', (event) => {
                this.toggle();
            });

            // close popup on window resize to prevent location shofting
            window.addEventListener('resize', (event) => {
                if (this.show) {
                    this.close();
                }
            });

            // close popu on click outside if required
            if (this.closeOnClickOutside && !this.modal){
                this.popup.nativeElement.addEventListener('mousedown', (event) => {
                    event.stopPropagation();
                })
                document.body.addEventListener('mousedown', (event) => {
                    if (this.show) {
                        this.close();
                    }
                })
            }

            if (this.parentPopup){
                this.parentPopup.stateNotifier.subscribe(event => {
                    if (event === "close"){
                        this.close();
                    }
                });
            }
        }
    }

    ngOnDestroy(){
        this.stateNotifier.complete();
        if (this.parentPopup){
            this.parentPopup.stateNotifier.unsubscribe();
        }
    }

    // private methods

    private validate(){
        const valid = this.popupWidth && this.popupHeight && this.targetRef;
        if (!valid){
            this.enabled = false;
            throw "Popup widget error: missing required parameters. Verify popupWidth, popupHeight and targetRef are defined.";
        }
        return valid;
    }

}

