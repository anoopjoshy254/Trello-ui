import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { Team } from '../../core/models/api.models';
import { HeaderComponent } from '../../layout/header/header';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { SpinnerComponent } from '../../shared/spinner/spinner';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, SpinnerComponent],
  templateUrl: './team-list.html',
  styleUrls: ['./team-list.css']
})
export class TeamListComponent implements OnInit {
  teamService = inject(TeamService);
  
  teams: Team[] = [];
  isLoading = true;
  isCreateModalOpen = false;
  
  newTeamName = '';
  newTeamDesc = '';
  isCreating = false;

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.isLoading = true;
    this.teamService.getTeams().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.teams = res.data;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
    this.newTeamName = '';
    this.newTeamDesc = '';
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  createTeam() {
    if (!this.newTeamName.trim()) return;

    this.isCreating = true;
    const dto = {
      name: this.newTeamName,
      description: this.newTeamDesc
    };

    this.teamService.createTeam(dto).subscribe({
      next: (res) => {
        this.isCreating = false;
        if (res.success) {
          this.closeCreateModal();
          this.loadTeams();
        }
      },
      error: () => this.isCreating = false
    });
  }
}
