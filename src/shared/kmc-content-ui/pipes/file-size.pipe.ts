import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'fileSize'})
export class FileSizePipe implements PipeTransform {
  transform(value: number): string {
  	if (value && typeof value === "number"){
	    return (value / 1024).toFixed(2) + " KB";
    }else{
        return "N/A";
    }

  }
}
