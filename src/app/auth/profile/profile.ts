import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../core/models/api.models';
import { SpinnerComponent } from '../../shared/spinner/spinner';
import { AvatarComponent } from '../../shared/avatar/avatar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, AvatarComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  authService = inject(AuthService);

  user: User | null = null;
  isLoading = true;
  isSaving = false;
  message = '';
  isError = false;

  profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    bio: [''],
    phoneNumber: ['']
  });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.user = res.data;
            this.profileForm.patchValue({
              firstName: this.user.firstName,
              lastName: this.user.lastName,
              email: this.user.email,
              bio: this.user.bio,
              phoneNumber: this.user.phoneNumber
            });
          }
          this.isLoading = false;
        },
        error: () => {
          this.message = 'Failed to load profile';
          this.isError = true;
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid || !this.user) {
      return;
    }

    this.isSaving = true;
    this.message = '';
    
    // Create an update DTO
    const dto = {
      ...this.user,
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      bio: this.profileForm.get('bio')?.value,
      phoneNumber: this.profileForm.get('phoneNumber')?.value
    };

    this.userService.updateUser(this.user.id, dto).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          this.message = 'Profile updated successfully!';
          this.isError = false;
          // Update local storage full name if changed
          const fullName = `${dto.firstName} ${dto.lastName}`;
          localStorage.setItem('fullName', fullName);
        } else {
          this.message = res.message;
          this.isError = true;
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.message = err.error?.message || 'Failed to update profile';
        this.isError = true;
      }
    });
  }
}
