import { Component, computed, input, output } from '@angular/core';

const MAX_VISIBLE_PAGES = 7;

type PageSlot = number | 'ellipsis';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly label = input('Pagination');

  readonly pageChange = output<number>();

  readonly isFirst = computed(() => this.page() <= 0);
  readonly isLast = computed(() => this.page() >= this.totalPages() - 1);

  readonly slots = computed<PageSlot[]>(() => {
    const total = this.totalPages();
    const current = this.page();

    if (total <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: total }, (_, index) => index);
    }

    const last = total - 1;
    const start = Math.max(1, Math.min(current - 1, total - 4));
    const end = Math.min(last - 1, Math.max(current + 1, 3));

    const slots: PageSlot[] = [0];
    if (start > 1) {
      slots.push('ellipsis');
    }
    for (let index = start; index <= end; index++) {
      slots.push(index);
    }
    if (end < last - 1) {
      slots.push('ellipsis');
    }
    slots.push(last);

    return slots;
  });

  goTo(page: number): void {
    if (page < 0 || page > this.totalPages() - 1 || page === this.page()) {
      return;
    }
    this.pageChange.emit(page);
  }
}
