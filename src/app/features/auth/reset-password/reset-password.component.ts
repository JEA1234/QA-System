import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  loading = false;
  
  // Validation state
  hasLength = false;
  hasCasing = false;
  hasNumber = false;
  hasSpecial = false;
  score = 0;
  passwordsMatch = true;

  timerSeconds = 3600; // 60 minutes
  timerDisplay = '60:00';
  interval: any;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });

    this.interval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        const m = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
        const s = (this.timerSeconds % 60).toString().padStart(2, '0');
        this.timerDisplay = `${m}:${s}`;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
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
    if (this.score === 1) return 'Nivel: DÃ©bil';
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
    if (this.loading || this.score < 2 || !this.passwordsMatch || !this.token) return;

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      nuevaPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success(
          'Contraseña restablecida',
          'Tu contraseña ha sido actualizada correctamente. Inicia sesión.'
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(
          'Error al restablecer contraseña',
          err.error?.error || 'No se pudo restablecer la contraseña. El enlace puede haber caducado.'
        );
      }
    });
  }
}