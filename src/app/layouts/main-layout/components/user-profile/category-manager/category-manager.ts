import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../../../core/services/category-service';
import { Category } from '../../../../../core/interfaces/category';

const DEFAULT_COLOR = '#6366f1';

@Component({
  selector: 'app-category-manager',
  imports: [],
  templateUrl: './category-manager.html',
})
export class CategoryManager implements OnInit {
  readonly categoryService = inject(CategoryService);
  readonly categories = this.categoryService.categories;

  readonly newName = signal('');
  readonly newColor = signal(DEFAULT_COLOR);

  readonly editingId = signal<string | null>(null);
  readonly editName = signal('');
  readonly editColor = signal(DEFAULT_COLOR);

  ngOnInit(): void {
    this.categoryService.list();
  }

  add(event: Event) {
    event.preventDefault();
    const name = this.newName().trim();
    if (!name) return;

    this.categoryService.create(
      { name, colorHex: this.newColor() },
      {
        onSuccess: () => {
          this.newName.set('');
          this.newColor.set(DEFAULT_COLOR);
        },
      },
    );
  }

  startEdit(category: Category) {
    if (category.default) return;
    this.editingId.set(category.id);
    this.editName.set(category.name);
    this.editColor.set(category.colorHex);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(event: Event) {
    event.preventDefault();
    const id = this.editingId();
    const name = this.editName().trim();
    if (!id || !name) return;

    this.categoryService.update(
      { id, name, colorHex: this.editColor() },
      { onSuccess: () => this.editingId.set(null) },
    );
  }

  remove(category: Category) {
    if (category.default) return;
    this.categoryService.delete({ id: category.id });
  }
}
