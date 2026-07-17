import { Component, inject, input, output, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { Category } from '../../../core/interfaces/category';
import { CategoryService } from '../../../core/services/category-service';

@Component({
  selector: 'app-category-picker',
  imports: [OverlayModule],
  templateUrl: './category-picker.html',
})
export class CategoryPicker {
  categoryService = inject(CategoryService);

  selected = input<Category | null>(null);
  changed = output<Category | null>();

  open = signal(false);
  categories = this.categoryService.categories;

  positions: ConnectedPosition[] = [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  toggle() {
    if (this.open()) {
      this.close();
      return;
    }
    this.categoryService.list();
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  select(category: Category | null) {
    this.changed.emit(category);
    this.close();
  }
}
