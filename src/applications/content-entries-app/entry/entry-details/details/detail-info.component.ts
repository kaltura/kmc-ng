import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'kDetailInfo',
    templateUrl: './detail-info.component.html',
    styleUrls: ['./detail-info.component.scss']
})
export class DetailInfoComponent implements OnInit {

    @Input() label: string;
    @Input() value: string;
    @Input() valueField: string;
    @Input() link: string;
    @Input() tooltip: string;
    @Input() toolTipAsHTML: boolean;
    @Input() iconStyle: string;
    @Input() separator: string = "|";
    @Input() maxItemWidth: number = 300;
    @Input() isLastItem: boolean = false;

    @Output() itemClick = new EventEmitter<any>();

    public _data : any;

    public _setData(data : any)
    {
        this._data = data;
    }

    public isClickabke: boolean = false;

    constructor() {
    }

    ngOnInit() {
        this.isClickabke = this.itemClick.observers.length > 0;
    }

    onClick($event: MouseEvent){
        if (this.isClickabke){
            this.itemClick.emit($event);
        }
    }
}
