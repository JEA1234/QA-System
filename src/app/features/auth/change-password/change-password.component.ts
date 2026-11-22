import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  passwordActual = '';
  newPassword = '';
  confirmPassword = '';
  showPasswordActual = false;
  showPassword = false;
  loading = false;
  
  // Validation state
  hasLength = false;
  hasCasing = false;
  hasNumber = false;
  hasSpecial = false;
  score = 0;
  passwordsMatch = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    private toastService: ToastService
  ) {}

  togglePasswordActual() {
    this.showPasswordActual = !this.showPasswordActual;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  evaluatePassword() {
    const p = this.newPassword;
    this.hasLength = p.length >= 8;
    this.hasCasing = /[A-Z]/.test(p) && /[a-z]/.test(p);
    this.hasNumber = /[0-9]/.test(p);
    this.hasSpecial = /[@$!%*?&#]/.test(p);
    
    this.score = [this.hasLength, this.hasCasing, this.hasNumber, this.hasSpecial].filter(Boolean).length;
    this.checkMatch();
  }

  checkMatch() {
    if (!this.confirmPassword) {
      this.passwordsMatch = true;
      return;
    }
    this.passwordsMatch = (this.newPassword === this.confirmPassword);
  }

  get strengthLabel() {
    if (this.score === 1) return 'Nivel: Débil';
    if (this.score === 2) return 'Nivel: Media';
    if (this.score === 3) return 'Nivel: Buena';
    if (this.score === 4) return 'Nivel: Fuerte';
    return 'Nivel: Incompleta';
  }

  get strengthClass() {
    if (this.score === 1) return 'text-error';
    if (this.score === 2) return 'text-secondary';
    if (this.score >= 3) return 'text-primary';
    return 'text-outline';
  }

  onSubmit() {
    if (this.loading || this.score < 2 || !this.passwordsMatch || !this.passwordActual) return;

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/change-password`, {
      passwordActual: this.passwordActual,
      nuevaPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success(
          'Contraseña actualizada',
          'Tu contraseña ha sido actualizada correctamente. Inicia sesión nuevamente.'
        );
        setTimeout(() => {
          this.auth.logout();
        }, 1200);
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(
          'Error al cambiar contraseña',
          err.error?.error || 'No se pudo actualizar la contraseña. Verifica tu contraseña actual.'
        );
      }
    });
  }
}