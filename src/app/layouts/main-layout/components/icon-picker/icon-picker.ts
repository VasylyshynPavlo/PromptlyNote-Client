import { Component, computed, input, output, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';

const ICONS: string[] = [
  'done',
  'done_all',
  'check',
  'close',
  'remove_done',
  'check_circle_outline',
  'task_alt',
  'verified',
  'verified_user',
  'approval',
  'grading',
  'quiz',
  'help',
  'info',
  'warning',
  'error',
  'new_releases',
  'tips_and_updates',

  'sticky_note_2',
  'description',
  'article',
  'feed',
  'receipt',
  'receipt_long',
  'summarize',
  'subject',
  'notes',
  'text_snippet',
  'description',
  'content_paste',
  'content_copy',
  'content_cut',
  'copy_all',
  'save',
  'save_alt',
  'draft',
  'folder',
  'folder_open',

  'inventory',
  'inventory_2',
  'archive',
  'unarchive',
  'inbox',
  'outbox',
  'move_to_inbox',
  'create_new_folder',
  'file_open',
  'folder_shared',
  'folder_special',
  'workspaces',
  'work',
  'business_center',
  'badge',
  'contacts',
  'contact_page',
  'groups',
  'person',
  'supervisor_account',

  'event',
  'event_available',
  'event_busy',
  'event_upcoming',
  'date_range',
  'edit_calendar',
  'upcoming',
  'timelapse',
  'timer',
  'timer_10',
  'timer_3',
  'hourglass_top',
  'hourglass_bottom',
  'more_time',
  'access_time',
  'av_timer',
  'query_builder',
  'pending',
  'repeat',
  'repeat_one',

  'sort',
  'sort_by_alpha',
  'reorder',
  'swap_vert',
  'compare_arrows',
  'tune',
  'settings',
  'settings_applications',
  'manage_search',
  'search',
  'find_in_page',
  'filter_alt',
  'view_list',
  'view_module',
  'view_agenda',
  'view_headline',
  'view_stream',
  'dashboard',
  'table_rows',
  'table_chart',

  'extension',
  'extension_off',
  'widgets',
  'apps',
  'grid_view',
  'apps_outage',
  'layers',
  'layers_clear',
  'dataset',
  'schema',
  'storage',
  'dns',
  'cloud',
  'cloud_done',
  'cloud_sync',
  'cloud_upload',
  'cloud_download',
  'sync',
  'sync_alt',
  'autorenew',

  'build',
  'construction',
  'engineering',
  'handyman',
  'design_services',
  'auto_fix_high',
  'bolt',
  'rocket_launch',
  'psychology',
  'lightbulb',
  'emoji_objects',
  'insights',
  'analytics',
  'monitoring',
  'assessment',
  'leaderboard',
  'trending_up',
  'track_changes',
  'timeline',
  'show_chart',

  'favorite',
  'favorite_border',
  'thumb_up',
  'thumb_down',
  'emoji_events',
  'military_tech',
  'workspace_premium',
  'local_offer',
  'sell',
  'redeem',
  'shopping_bag',
  'shopping_cart',
  'paid',
  'payments',
  'account_balance',
  'account_balance_wallet',
  'attach_money',
  'credit_score',
  'savings',
  'request_quote'
];

@Component({
  selector: 'app-icon-picker',
  imports: [OverlayModule],
  templateUrl: './icon-picker.html',
})
export class IconPicker {
  open = signal(false);
  value = input<string>();
  changed = output<string>();
  positions: ConnectedPosition[] = [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];
  ICONS = ICONS;

  toggle() {
    if (this.open()) {
      this.close();
      return;
    }
    this.open.set(true);
  }

  set(iconName: string) {
    this.changed.emit(iconName);
    this.close();
  }

  close() {
    this.open.set(false);
  }

  clear() {
    this.changed.emit('check_box');
    this.close();
  }
}
