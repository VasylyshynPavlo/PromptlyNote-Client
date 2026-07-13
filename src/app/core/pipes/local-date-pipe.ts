import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDate',
  standalone: true
})
export class LocalDatePipe implements PipeTransform {
  transform(value: any, dateStyle: 'short' | 'medium' | 'long' = 'short', timeStyle: 'short' | 'medium' = 'short'): string {
    if (!value) return '';

    const date = new Date(value);
    
    if (isNaN(date.getTime())) return value; 

    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: dateStyle,
      timeStyle: timeStyle
    }).format(date);
  }
}