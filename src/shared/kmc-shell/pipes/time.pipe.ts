import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
  transform(value: number): string {

    let hours: number = Math.floor( Math.round( value ) / 3600 ) % 24;
    let minutes: number = Math.floor( ( Math.round( value ) / 60 ) % 60 );
    let seconds: number = Math.round(value) % 60;

    let hoursStr: string = hours === 0 ? '' : hours.toString() + ":";
    let minutesStr: string = minutes === 0 && hours === 0 ? '00' : minutes < 10  ? '0' + minutes.toString() : minutes.toString();
    let secondsStr: string = seconds < 10  ? '0' + seconds.toString() : seconds.toString();

    return hoursStr + minutesStr + ":" + secondsStr;
  }
}
