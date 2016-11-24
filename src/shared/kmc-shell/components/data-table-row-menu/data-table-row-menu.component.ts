import { Component, OnInit, OnDestroy,Input, ViewChild,  ElementRef} from '@angular/core';
import {Menu, MenuItem} from 'primeng/primeng';

import * as $ from 'jquery';
@Component({
    selector: 'kDataTableRowMenu',
    templateUrl: './data-table-row-menu.component.html',
    styleUrls: ['./data-table-row-menu.component.scss']
})
export class DataTableRowMenu implements OnInit, OnDestroy {

    @Input()
    private items: MenuItem[];

    @ViewChild(Menu)
    private menu : Menu;

    @ViewChild('button')
    private menuButtonRef : ElementRef;
    private menuButton : any;
    private monitorIntervalId = null;
    private isMouseEnter : boolean = false;
    private isMenuButtonVisible = false;

    constructor(private elementRef : ElementRef) {}

    ngOnInit() {
        const elementRow = $(this.elementRef.nativeElement).closest('tr');

        if (elementRow) {
            this.menuButton = $(this.menuButtonRef.nativeElement);

            // TODO workaround for the scss not importing images correctly
            const newUrl = this.menuButton.css('background-image').replace(/\/css/g, "/");
            this.menuButton.css('background-image', newUrl);

            this.menuButton.hide();

            elementRow.on('mouseenter', () => {
                this.isMouseEnter = true;
                this.updateButtonVisibility(true);
            });

            elementRow.on('mouseleave', () => {
                this.isMouseEnter = false;
                this.updateButtonVisibility(false);
            });
        }
    }

    updateButtonVisibility(shouldShow : boolean) : void
    {
        if (shouldShow)
        {
            if (!this.isMenuButtonVisible)
            {
                // delay menu show (if user just pass on the row
                setTimeout(() =>
                {
                    if (!this.isMenuButtonVisible && this.isMouseEnter)
                    {
                        // still relevant - show button
                        this.menuButton.fadeIn();
                        this.isMenuButtonVisible = true;
                    }
                },200);
            }
        }else
        {
            if (this.isMenuButtonVisible)
            {
                // check if menu is currently shown
                if (!this.menu.container.offsetParent)
                {
                    // menu is not visible, hide button
                    this.menuButton.fadeOut();
                    this.isMenuButtonVisible = false;
                }else
                {
                    // wait until user closes menu
                    this.monitorIntervalId = setInterval(() =>
                    {
                        if (!this.menu.container.offsetParent)
                        {
                            // menu closed
                            if (this.monitorIntervalId) {
                                clearInterval(this.monitorIntervalId);
                                this.monitorIntervalId = null;
                            }

                            if (this.isMenuButtonVisible && !this.isMouseEnter)
                            {
                                // still relevant - hide button
                                this.menuButton.fadeOut();
                                this.isMenuButtonVisible = false;
                            }
                        }
                    },1000);
                }
            }
        }

    }

    ngOnDestroy(){

    }


}
