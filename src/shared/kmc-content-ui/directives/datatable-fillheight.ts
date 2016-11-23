import { Directive, ElementRef, Input, Renderer, AfterViewInit, OnDestroy, ContentChild } from '@angular/core';
import { DataTable } from 'primeng/primeng';

function isDataTable(x : DataTable) : x is DataTable
{
  return x ? !!x.onEdit : false;
}

@Directive({
  selector: '[fillHeight]',
})
export class FillHeightDirective implements AfterViewInit{

  @ContentChild('dataTable') public dataTable: DataTable;

  intervalID: any = null;
  currentHeight;

  constructor(private el: ElementRef, renderer: Renderer) {
  }

  ngAfterViewInit(){
    if (!isDataTable(this.dataTable)){
      return;
    }
    const scrollBody = this.dataTable.scrollBody;
    const scrollHeader = this.dataTable.scrollHeader;
    this.currentHeight = this.el.nativeElement.clientHeight;

    this.intervalID = setInterval( () => {
      if (this.el.nativeElement.clientHeight !== this.currentHeight){
        this.currentHeight = this.el.nativeElement.clientHeight;
        if (scrollBody){
          scrollBody.style.maxHeight = (this.el.nativeElement.clientHeight - scrollHeader.clientHeight) + "px";
        }
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
