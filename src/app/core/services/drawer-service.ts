import { inject, Service, TemplateRef, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Service()
export class DrawerService {
  private readonly overlay = inject(Overlay);

  open(parameters: {
    template: TemplateRef<unknown>;
    viewContainerRef: ViewContainerRef;
    side: 'left' | 'right';
    close: () => void;
  }): OverlayRef {
    const position = this.overlay.position().global().top();
    if (parameters.side === 'left') {
      position.left();
    } else {
      position.right();
    }

    const overlayRef = this.overlay.create({
      positionStrategy: position,
      height: '100%',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });

    overlayRef.backdropClick().subscribe(() => parameters.close());
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') parameters.close();
    });

    overlayRef.attach(new TemplatePortal(parameters.template, parameters.viewContainerRef));

    return overlayRef;
  }
}
