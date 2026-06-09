import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { Team, TeamMember, User } from '../../core/models/api.models';
import { HeaderComponent } from '../../layout/header/header';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { SpinnerComponent } from '../../shared/spinner/spinner';
import { AvatarComponent } from '../../shared/avatar/avatar';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, SpinnerComponent, AvatarComponent],
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.css']
})
export class TeamDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  teamService = inject(TeamService);
  userService = inject(UserService);

  teamId!: number;
  team: Team | null = null;
  members: TeamMember[] = [];
  isLoading = true;

  // Add Member
  isAddMemberModalOpen = false;
  searchQuery = '';
  searchResults: User[] = [];
  isSearching = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.teamId = parseInt(id, 10);
        this.loadTeam();
      }
    });
  }

  loadTeam() {
    this.isLoading = true;
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.team = res.data;
          this.loadMembers();
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadMembers() {
    this.teamService.getTeamMembers(this.teamId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.members = res.data;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openAddMemberModal() {
    this.isAddMemberModalOpen = true;
    this.searchQuery = '';
    this.searchResults = [];
  }

  closeAddMemberModal() {
    this.isAddMemberModalOpen = false;
  }

  searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.userService.getUsers(1, 10, this.searchQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.searchResults = res.data.items.filter(u => !this.members.find(m => m.userId === u.id));
        }
        this.isSearching = false;
      },
      error: () => this.isSearching = false
    });
  }

  isEmail(query: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
  }

  inviteByEmail() {
    if (!this.isEmail(this.searchQuery)) {
      alert("Please enter a valid email address.");
      return;
    }
    
    this.teamService.inviteUser(this.teamId, this.searchQuery).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Invitation sent successfully to ' + this.searchQuery);
          this.closeAddMemberModal();
        } else {
          alert('Failed to send invitation: ' + res.message);
        }
      },
      error: (err) => {
        alert('Failed to send invitation. It might have already been sent.');
      }
    });
  }

  addMember(user: User) {
    const dto = {
      userId: user.id,
      role: 'Member'
    };

    this.teamService.addTeamMember(this.teamId, dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadMembers();
          this.searchResults = this.searchResults.filter(u => u.id !== user.id);
        }
      }
    });
  }

  removeMember(userId: number) {
    if (confirm('Are you sure you want to remove this member?')) {
      this.teamService.removeTeamMember(this.teamId, userId).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadMembers();
          }
        }
      });
    }
  }
}
