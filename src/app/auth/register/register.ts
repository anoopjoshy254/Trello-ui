import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SpinnerComponent } from '../../shared/spinner/spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SpinnerComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      ...this.registerForm.value,
      confirmPassword: this.registerForm.value.password // API requires confirmPassword
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Registration successful! You can now log in.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        
        // Handle FluentValidation / ASP.NET validation errors
        if (err.error?.errors) {
          const firstErrorKey = Object.keys(err.error.errors)[0];
          this.errorMessage = err.error.errors[firstErrorKey][0];
        } else {
          this.errorMessage = err.error?.message || 'Registration failed. Please check password requirements (8+ chars, uppercase, lowercase, digit, special char).';
        }
      }
    });
  }
}
