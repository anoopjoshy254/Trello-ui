import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../core/models/api.models';
import { TeamService } from '../../services/team.service';
import { SpinnerComponent } from '../../shared/spinner/spinner';
import { HeaderComponent } from '../../layout/header/header';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    SpinnerComponent, 
    HeaderComponent, 
    SidebarComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  projectService = inject(ProjectService);

  projects: Project[] = [];
  isLoading = true;
  isSidebarCollapsed = false;

  // Create Project Modal
  isCreateModalOpen = false;
  newProjectName = '';
  newProjectColor = '#0052CC';
  newProjectTeamId: number | null = null;
  isCreating = false;

  teams: any[] = [];
  teamService = inject(TeamService);

  ngOnInit() {
    this.loadProjects();
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.teams = res.data;
          if (this.teams.length > 0) {
            this.newProjectTeamId = this.teams[0].id;
          }
        }
      }
    });
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getMyProjects().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.projects = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
    this.newProjectName = '';
    this.newProjectColor = '#0052CC';
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  createProject() {
    if (!this.newProjectName.trim()) return;

    this.isCreating = true;
    const dto: any = {
      name: this.newProjectName,
      color: this.newProjectColor
    };
    if (this.newProjectTeamId) {
      dto.teamId = this.newProjectTeamId;
    }

    this.projectService.createProject(dto).subscribe({
      next: (res) => {
        this.isCreating = false;
        if (res.success) {
          this.closeCreateModal();
          this.loadProjects();
        }
      },
      error: () => {
        this.isCreating = false;
      }
    });
  }

  selectColor(color: string) {
    this.newProjectColor = color;
  }

  presetColors = [
    '#0052CC', // Trello Blue
    '#00B8D9', // Teal
    '#36B37E', // Green
    '#FFAB00', // Yellow
    '#FF5630', // Red
    '#6554C0', // Purple
    '#FF7452', // Orange
    '#344563'  // Dark Blue
  ];
}
