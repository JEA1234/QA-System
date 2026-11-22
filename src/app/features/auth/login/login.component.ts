import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  correo = '';
  password = '';
  recordar = true;
  showPassword = false;
  loading = false;

  showAlert = false;
  alertTitle = '';
  alertDesc = '';
  bloqueado = false;

  constructor(private auth: AuthService, private router: Router) {
    // Si ya esta logueado, redirigir
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loading || this.bloqueado) return;
    this.loading = true;
    this.showAlert = false;

    const credentials: LoginRequest = {
      correo: this.correo,
      password: this.password,
    };

    this.auth.login(credentials).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.debeCambiarPassword) {
          this.router.navigate(['/change-password']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.showAlert = true;

        const msg = err.error?.error || 'Error de conexion con el servidor';

        if (msg.includes('bloqueada')) {
          this.alertTitle = 'Cuenta bloqueada temporalmente';
          this.alertDesc = 'Has superado el limite de intentos fallidos. Por politica de seguridad RNF-001, tu cuenta ha sido suspendida.';
          this.bloqueado = true;
        } else {
          this.alertTitle = 'Credenciales incorrectas';
          this.alertDesc = msg;
        }
      },
    });
  }
}