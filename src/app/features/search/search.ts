import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MIN_SEARCH_LENGTH, SearchService } from '../../core/services/search-service';

@Component({
  selector: 'app-search',
  imports: [RouterLink],
  templateUrl: './search.html',
  host: { class: 'block h-full min-h-0' },
})
export class Search {
  readonly search = inject(SearchService);

  readonly term = input('');

  readonly minSearchLength = MIN_SEARCH_LENGTH;
  readonly trimmedTerm = computed(() => this.term().trim());
  readonly termTooShort = computed(() => this.trimmedTerm().length < MIN_SEARCH_LENGTH);
  readonly resultCount = computed(
    () =>
      this.search.tasks().data.length +
      this.search.taskLists().data.length +
      this.search.categories().data.length,
  );

  constructor() {
    effect(() => this.search.search(this.term()));
  }
}
