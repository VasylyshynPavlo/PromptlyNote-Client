import { Component, input, output, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CreateSubTask } from '../../../../core/interfaces/api/create-task';

@Component({
  selector: 'app-steps-picker',
  imports: [OverlayModule, DragDropModule],
  templateUrl: './steps-picker.html',
})
export class StepsPicker {
  value = input<CreateSubTask[]>([]);
  changed = output<CreateSubTask[]>();

  open = signal(false);
  steps = signal<CreateSubTask[]>([{ name: '', isCompleted: false }]);

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
    const existing = this.value().map((s) => ({ name: s.name, isCompleted: s.isCompleted }));
    this.steps.set([...existing, { name: '', isCompleted: false }]);
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  update(index: number, name: string) {
    this.steps.update((steps) => {
      const next = steps.map((s, i) => (i === index ? { ...s, name } : s));
      if (index === next.length - 1 && name.trim() !== '') {
        next.push({ name: '', isCompleted: false });
      }
      return next;
    });
  }

  remove(index: number) {
    this.steps.update((steps) => {
      if (steps.length <= 1) return steps;
      const next = steps.filter((_, i) => i !== index);
      if (next.length === 0 || next[next.length - 1].name.trim() !== '') {
        next.push({ name: '', isCompleted: false });
      }
      return next;
    });
  }

  drop(event: CdkDragDrop<CreateSubTask[]>) {
    this.steps.update((steps) => {
      const next = [...steps];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      const filled = next.filter((s) => s.name.trim() !== '');
      filled.push({ name: '', isCompleted: false });
      return filled;
    });
  }

  save() {
    const cleaned = this.steps()
      .map((s) => ({ ...s, name: s.name.trim() }))
      .filter((s) => s.name !== '');
    this.changed.emit(cleaned);
    this.close();
  }
}
