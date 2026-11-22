import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  correo = '';
  loading = false;
  success = false;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  onSubmit() {
    if (!this.correo || this.loading) return;

    this.loading = true;
    this.success = false;

    this.http.post<{mensaje: string, token?: string}>(`${environment.apiUrl}/auth/forgot-password`, { correo: this.correo })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.success = true;
          this.toastService.success(
            'Enlace enviado',
            'Se ha generado el enlace de recuperación exitosamente.'
          );
          // SOLO PARA DESARROLLO: Mostrar el token en consola para poder probar sin email
          if (res.token) {
            console.log('TOKEN DE RECUPERACION (solo dev):', res.token);
          }
        },
        error: (err) => {
          this.loading = false;
          this.toastService.error(
            'Error al solicitar recuperación',
            err.error?.error || 'No se pudo procesar la solicitud. Verifique el correo.'
          );
        }
      });
  }
}