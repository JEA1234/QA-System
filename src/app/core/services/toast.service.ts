import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastMessage, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  show(type: ToastType, title: string, message: string, duration: number = 4000): void {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const toast: ToastMessage = { id, type, title, message, duration };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(title: string, message: string, duration: number = 4000): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration: number = 5000): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration: number = 4000): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration: number = 4000): void {
    this.show('info', title, message, duration);
  }

  remove(id: string): void {
    const updated = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(updated);
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}

