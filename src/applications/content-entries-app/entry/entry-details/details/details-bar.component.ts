import { Component, ElementRef, Input, QueryList, ContentChildren, AfterContentInit, ViewChild, HostListener } from '@angular/core';
import { DetailInfoComponent } from './detail-info.component';


@Component({
  selector: 'k-details-bar',
  templateUrl: './details-bar.component.html',
  styleUrls: ['./details-bar.component.scss']
})
export class DetailsBarComponent implements AfterContentInit {

  @ContentChildren(DetailInfoComponent) items: QueryList<DetailInfoComponent>;

  @Input() basicDetailsLabel: string = "Basic Details";
  @Input() moreDetailsLabel: string = "More Details";

  @ViewChild('dataPanel') dataPanel: ElementRef;
  @ViewChild('dataWrapper') dataWrapper: ElementRef;
  public _showMore: boolean = false;
  public _showBasic: boolean = false;
  private showMoreCheckIntervalID: any;
  private lineScroll = 0;
  private disableScroll: boolean = false;

  ngAfterContentInit() {
    this.updateLayout();
  }

  @HostListener('window:resize')
  private onResize() {
    this.updateLayout();
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
      const marginTop = parseInt(window.getComputedStyle(this.dataWrapper.nativeElement).marginTop);
      const elementHeight = this.dataWrapper.nativeElement.children.length ? this.dataWrapper.nativeElement.children[0].clientHeight : 0;
      console.log("--> marginTop="+Math.abs(marginTop)+ ', this.dataWrapper.nativeElement.clientHeight= '+(this.dataWrapper.nativeElement.clientHeight + marginTop));
      this._showMore = this.dataWrapper.nativeElement.clientHeight > this.dataPanel.nativeElement.getBoundingClientRect().height && Math.abs(marginTop) < (this.dataWrapper.nativeElement.clientHeight + marginTop);
      this._showBasic = this.dataWrapper.nativeElement.clientHeight > this.dataPanel.nativeElement.getBoundingClientRect().height && marginTop < 0 ;
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
      this.dataWrapper.nativeElement.style.marginTop = this.dataWrapper.nativeElement.children[0].clientHeight * (-1) * this.lineScroll + "px";
      setTimeout(()=>{
        this.updateLayout(); // allow animation to finish before recalculating
        this.disableScroll = false;
      },350);
    }

  }

  reset(){
    this.dataWrapper.nativeElement.style.marginTop = "0px";
    this.updateLayout();
  }
}

