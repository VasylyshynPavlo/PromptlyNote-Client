import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDate',
  standalone: true
})
export class LocalDatePipe implements PipeTransform {
  transform(value: any, dateStyle: 'short' | 'medium' | 'long' = 'short', timeStyle: 'short' | 'medium' = 'short'): string {
    if (!value) return '';

    const date = new Date(this.asUtc(value));

    if (isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: dateStyle,
      timeStyle: timeStyle
    }).format(date);
  }

  private asUtc(value: any): any {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(value)) {
      return value + 'Z';
    }
    return value;
  }
}