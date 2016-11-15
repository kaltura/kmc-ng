import { Directive, ElementRef, Input, Renderer, AfterViewInit, OnDestroy, ContentChild } from '@angular/core';
import { DataTable } from 'primeng/primeng';

@Directive({
  selector: '[fillHeight]',
})
export class FillHeightDirective implements AfterViewInit{

  @ContentChild('dataTable') public dataTable: DataTable;

  @Input() set watchers(elements: any[]){
    this.watchedElements = elements;
    for (let i = 0; i < elements.length; i++){
      this.watchersHeight += parseInt(elements[i].style.height);
    }
  }

  watchedElements: any[] = [];
  watchersHeight: number = 0;
  intervalID: any = null;
  offsetTop = 0;

  constructor(private el: ElementRef, renderer: Renderer) {
  }

  ngAfterViewInit(){
    const scrollBody = this.dataTable.scrollBody;
    const scrollHeader = this.dataTable.scrollHeader;

    this.intervalID = setInterval( () => {

      // init offsetTop only on timeout to allow screen rendering to finish
      if (this.offsetTop === 0){
        this.offsetTop = this.el.nativeElement.offsetTop;
      }

      // handle offsetTop changes
      if (this.offsetTop !== this.el.nativeElement.offsetTop){
        const delta = this.el.nativeElement.offsetTop - this.offsetTop;
        this.offsetTop = this.el.nativeElement.offsetTop;
        if (scrollBody){
          const maxHeight = parseInt(scrollBody.style.maxHeight);
          scrollBody.style.maxHeight = (maxHeight - delta) + "px";
        }
      }

      // handle additional watched DOM elements hight changes
      if (this.watchedElements.length) {
        let updatedWatchersHeight = 0;
        for (let i = 0; i < this.watchedElements.length; i++) {
          updatedWatchersHeight += parseInt(this.watchedElements[i].style.height);
        }
        if (updatedWatchersHeight !== this.watchersHeight) {
          const delta = updatedWatchersHeight - this.watchersHeight;
          this.watchersHeight = updatedWatchersHeight;
          if (scrollBody) {
            const maxHeight = parseInt(scrollBody.style.maxHeight);
            scrollBody.style.maxHeight = (maxHeight - delta) + "px";
          }
        }
      }

      // fix for primeNG data table bug not reducing header height from the scroll calculation
      if (this.el.nativeElement.clientHeight === parseInt(scrollBody.style.maxHeight)){
        scrollBody.style.maxHeight = parseInt(scrollBody.style.maxHeight) - scrollHeader.clientHeight + "px";
      }

    },200);
  }

  ngOnDestroy(){
    if (this.intervalID){
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }
}
