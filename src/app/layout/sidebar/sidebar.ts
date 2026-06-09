import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../core/models/api.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  
  projectService = inject(ProjectService);
  projects: Project[] = [];

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getMyProjects().subscribe(res => {
      if (res.success && res.data) {
        this.projects = res.data;
      }
    });
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
