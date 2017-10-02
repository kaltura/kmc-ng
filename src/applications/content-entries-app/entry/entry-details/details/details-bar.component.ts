import { Component, ElementRef, Input, QueryList, ContentChildren, AfterContentInit, ViewChild, HostListener, OnDestroy, AfterViewChecked } from '@angular/core';
import { DetailInfoComponent } from './detail-info.component';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'k-details-bar',
  templateUrl: './details-bar.component.html',
  styleUrls: ['./details-bar.component.scss']
})
export class DetailsBarComponent implements AfterContentInit,AfterViewChecked,  OnDestroy {

  @ContentChildren(DetailInfoComponent) items: QueryList<DetailInfoComponent>;

  @Input() basicDetailsLabel: string = "Basic Details";
  @Input() moreDetailsLabel: string = "More Details";

  private _shouldUpdateItems = false;

  public _data: any;
  @Input() set data(dataObj: any) {
    this._data = dataObj;
    this._shouldUpdateItems = true;
    this.reset();
  }

  @ViewChild('dataPanel') dataPanel: ElementRef;
  @ViewChild('dataWrapper') dataWrapper: ElementRef;
  public _showMore: boolean = false;
  public _showBasic: boolean = false;
  private showMoreCheckIntervalID: any;
  private lineScroll = 0;
  private disableScroll: boolean = false;
  private _itemsChangesSubscription: ISubscription;

  ngAfterViewChecked(){
    if (this._shouldUpdateItems)
    {
      this._shouldUpdateItems = false;
      setTimeout(()=>{
        this.items.forEach(item => {
          item._setData(this._data);
        })
      },0);

    }
  }

  ngAfterContentInit() {
    this.updateLayout();

    this._itemsChangesSubscription = this.items.changes.subscribe(
        changes => {
          this._shouldUpdateItems = true;
        }
    );
  }

  @HostListener('window:resize')
  private onResize() {
    this.updateLayout();
  }

  private _updateItems(): void{

    if (this.items) {
      this.items.forEach(item => item._setData(this._data));
    }
  }
  updateLayout() {
    //we use a cancelable interval to improve performances on window resize
    if (this.showMoreCheckIntervalID) {
      clearInterval(this.showMoreCheckIntervalID);
      this.showMoreCheckIntervalID = null;
    }
    this.showMoreCheckIntervalID = setTimeout(() => {
      this.items.forEach(item => {
        item.isLastItem = false;
      });
      this.items.last.isLastItem = true;
      const marginTop = parseInt(window.getComputedStyle(this.dataWrapper.nativeElement).top);
      const elementHeight = this.dataWrapper.nativeElement.children.length ? this.dataWrapper.nativeElement.children[0].clientHeight : 0;
      this._showMore = this.dataWrapper.nativeElement.clientHeight > this.dataPanel.nativeElement.getBoundingClientRect().height && Math.abs(marginTop) < (this.dataWrapper.nativeElement.clientHeight + marginTop);
      this._showBasic = this.dataWrapper.nativeElement.clientHeight > this.dataPanel.nativeElement.getBoundingClientRect().height && marginTop < 0 ;

      // code to remove last separators in each line
      let topArr = [];
      if (this.dataWrapper.nativeElement.children.length){
        for (let i=0; i<this.dataWrapper.nativeElement.children.length; i++){
          const elm: any = this.dataWrapper.nativeElement.children[i];
          const top = elm.getBoundingClientRect().top;
          topArr.push(top);
        }
        for (let i=0; i<topArr.length-1; i++){
          if (topArr[i] < topArr[i+1] && this.items.length >= i){
            this.items.forEach((item, index)=>{
              if (i===index){
                item.isLastItem = true;
              }
            });
          }
        }
      }

      this.showMoreCheckIntervalID = null;
    }, 100);
  }

  show(direction: string) {
    if (!this.disableScroll){
      this.disableScroll = true;
      if (direction === "more") {
        this.lineScroll++;
      }
      else {
        this.lineScroll--;
      }
      this.dataWrapper.nativeElement.style.top = this.dataWrapper.nativeElement.children[0].clientHeight * (-1) * this.lineScroll + "px";
      setTimeout(()=>{
        this.updateLayout(); // allow animation to finish before recalculating
        this.disableScroll = false;
      },350);
    }

  }

  reset(){
    this.lineScroll = 0;
    this.dataWrapper.nativeElement.style.top = "0px";
    setTimeout(()=>{
      this.updateLayout(); // allow animation to finish before recalculating
    },350);
  }

  ngOnDestroy(){
    if (this._itemsChangesSubscription){
      this._itemsChangesSubscription.unsubscribe();
      this._itemsChangesSubscription = null;
    }
  }
}

