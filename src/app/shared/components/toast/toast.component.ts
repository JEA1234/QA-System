import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ToastMessage, ToastType } from '../../../core/models/toast.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastContainerComponent {
  toasts$: Observable<ToastMessage[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  cerrar(id: string): void {
    this.toastService.remove(id);
  }

  trackById(_index: number, item: ToastMessage): string {
    return item.id;
  }

  getIcon(type: ToastType): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }
}

