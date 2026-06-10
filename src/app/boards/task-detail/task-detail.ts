import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges,
  SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, Comment, Label, Checklist, ChecklistItem, Attachment, ActivityLog, TeamMember } from '../../core/models/api.models';
import { TaskService } from '../../services/task.service';
import { CommentService } from '../../services/comment.service';
import { LabelService } from '../../services/label.service';
import { ChecklistService } from '../../services/checklist.service';
import { AttachmentService } from '../../services/attachment.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { ProjectService } from '../../services/project.service';
import { TeamService } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import { SpinnerComponent } from '../../shared/spinner/spinner';
import { AvatarComponent } from '../../shared/avatar/avatar';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, AvatarComponent, QuillModule],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.css']
})
export class TaskDetailComponent implements OnInit, OnChanges {
  @Input() taskId!: number;
  @Input() isOpen = false;
  @Input() refreshTrigger = 0;
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  private taskService        = inject(TaskService);
  private commentService     = inject(CommentService);
  private labelService       = inject(LabelService);
  private checklistService   = inject(ChecklistService);
  private attachmentService  = inject(AttachmentService);
  private activityLogService = inject(ActivityLogService);
  private projectService     = inject(ProjectService);
  private teamService        = inject(TeamService);
  private authService        = inject(AuthService);

  task: Task | null = null;
  isLoading = true;

  // ── Description ─────────────────────────────────────
  isEditingDescription = false;
  descriptionInput = '';
  isSavingDescription = false;

  // ── Due Date ────────────────────────────────────────
  isEditingDueDate = false;
  dueDateInput = '';

  // ── Comments ────────────────────────────────────────
  newCommentText = '';
  isPostingComment = false;
  isCommentFocused = false;
  editingCommentId: number | null = null;
  editCommentText = '';

  // ── Labels ──────────────────────────────────────────
  isLabelsPanelOpen = false;
  projectLabels: Label[] = [];
  newLabelName = '';
  newLabelColor = '#0052cc';

  readonly LABEL_COLORS = [
    '#61bd4f','#f2d600','#ff9f1a','#eb5a46','#c377e0',
    '#0079bf','#00c2e0','#51e898','#ff78cb','#344563'
  ];

  // ── Checklists ──────────────────────────────────────
  isAddingChecklist = false;
  newChecklistTitle = '';
  newItemTexts: { [checklistId: number]: string } = {};
  isAddingItem: { [checklistId: number]: boolean } = {};

  // ── Attachments ──────────────────────────────────────
  attachments: Attachment[] = [];
  isUploadingAttachment = false;

  // ── Activity Log ─────────────────────────────────────
  activityLogs: ActivityLog[] = [];

  // ── Members ──────────────────────────────────────────
  isMembersPanelOpen = false;
  projectMembers: TeamMember[] = [];

  currentUserId: number | null = null;

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true && this.taskId) {
      this.loadTask();
    }
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange && this.isOpen) {
      this.loadTask();
    }
  }

  loadTask() {
    this.isLoading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.task = res.data;
          this.descriptionInput = this.task.description || '';
          this.dueDateInput = this.task.dueDate
            ? new Date(this.task.dueDate).toISOString().split('T')[0]
            : '';
          
          this.loadAttachments();
          this.loadActivityLogs();
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadAttachments() {
    if (!this.task) return;
    this.attachmentService.getAttachmentsByTask(this.task.id).subscribe(res => {
      if (res.success && res.data) this.attachments = res.data;
    });
  }

  loadActivityLogs() {
    if (!this.task) return;
    this.activityLogService.getTaskLogs(this.task.id).subscribe(res => {
      if (res.success && res.data) this.activityLogs = res.data;
    });
  }

  onClose() { this.close.emit(); }

  // ── Description ─────────────────────────────────────
  startEditDescription() {
    this.isEditingDescription = true;
    this.descriptionInput = this.task?.description || '';
  }

  cancelEditDescription() { this.isEditingDescription = false; }

  saveDescription() {
    if (!this.task) return;
    this.isSavingDescription = true;
    this.taskService.updateTask(this.task.id, {
      title: this.task.title,
      description: this.descriptionInput,
      priority: this.task.priority,
      dueDate: this.task.dueDate
    }).subscribe(res => {
      if (res.success) {
        this.task!.description = this.descriptionInput;
        this.isEditingDescription = false;
        this.taskUpdated.emit(this.task!);
      }
      this.isSavingDescription = false;
    });
  }

  // ── Due Date ────────────────────────────────────────
  saveDueDate() {
    if (!this.task) return;
    this.taskService.updateTask(this.task.id, {
      title: this.task.title,
      description: this.task.description,
      priority: this.task.priority,
      dueDate: this.dueDateInput || null
    }).subscribe(res => {
      if (res.success) {
        this.task!.dueDate = this.dueDateInput || undefined;
        this.isEditingDueDate = false;
        this.taskUpdated.emit(this.task!);
      }
    });
  }

  clearDueDate() {
    this.dueDateInput = '';
    this.saveDueDate();
  }

  getDueDateStatus(): 'overdue' | 'due-soon' | 'normal' | null {
    if (!this.task?.dueDate) return null;
    const due = new Date(this.task.dueDate);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'due-soon';
    return 'normal';
  }

  // ── Comments ────────────────────────────────────────
  addComment() {
    if (!this.newCommentText.trim() || !this.task) return;
    this.isPostingComment = true;
    this.commentService.createComment({ taskId: this.task.id, content: this.newCommentText }).subscribe({
      next: (res) => {
        if (res.success) {
          this.newCommentText = '';
          this.isCommentFocused = false;
          this.loadTask();
        }
        this.isPostingComment = false;
      },
      error: () => { this.isPostingComment = false; }
    });
  }

  startEditComment(comment: Comment) {
    this.editingCommentId = comment.id;
    this.editCommentText = comment.content;
  }

  cancelEditComment() {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  saveComment(comment: Comment) {
    if (!this.editCommentText.trim()) return;
    this.commentService.updateComment(comment.id, { content: this.editCommentText }).subscribe(res => {
      if (res.success) {
        comment.content = this.editCommentText;
        comment.isEdited = true;
        this.editingCommentId = null;
        this.loadActivityLogs(); // Refresh activity log
      }
    });
  }

  deleteComment(commentId: number) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe(res => {
        if (res.success && this.task?.comments) {
          this.task.comments = this.task.comments.filter(c => c.id !== commentId);
          this.loadActivityLogs(); // Refresh activity log
        }
      });
    }
  }

  // ── Labels ──────────────────────────────────────────
  toggleLabelsPanel() {
    this.isLabelsPanelOpen = !this.isLabelsPanelOpen;
    if (this.isLabelsPanelOpen && this.task) {
      this.labelService.getLabels(this.task.projectId).subscribe(res => {
        if (res.success && res.data) this.projectLabels = res.data;
      });
    }
  }

  isLabelApplied(label: Label): boolean {
    return !!this.task?.labels?.some(l => l.id === label.id);
  }

  toggleLabel(label: Label) {
    if (!this.task) return;
    if (this.isLabelApplied(label)) {
      this.labelService.removeLabel(label.id, this.task.id).subscribe(res => {
        if (res.success) {
          this.task!.labels = this.task!.labels?.filter(l => l.id !== label.id);
        }
      });
    } else {
      this.labelService.applyLabel(label.id, this.task.id).subscribe(res => {
        if (res.success) {
          if (!this.task!.labels) this.task!.labels = [];
          this.task!.labels.push(label);
        }
      });
    }
  }

  createLabel() {
    if (!this.newLabelName.trim() || !this.task) return;
    this.labelService.createLabel({
      name: this.newLabelName,
      color: this.newLabelColor,
      projectId: this.task.projectId
    }).subscribe(res => {
      if (res.success && res.data) {
        this.projectLabels.push(res.data);
        this.newLabelName = '';
      }
    });
  }

  // ── Checklists ──────────────────────────────────────
  addChecklist() {
    if (!this.newChecklistTitle.trim() || !this.task) return;
    this.checklistService.createChecklist({
      title: this.newChecklistTitle,
      taskId: this.task.id
    }).subscribe(res => {
      if (res.success && res.data) {
        if (!this.task!.checklists) this.task!.checklists = [];
        this.task!.checklists.push(res.data);
        this.newChecklistTitle = '';
        this.isAddingChecklist = false;
      }
    });
  }

  deleteChecklist(checklistId: number) {
    this.checklistService.deleteChecklist(checklistId).subscribe(res => {
      if (res.success) {
        this.task!.checklists = this.task!.checklists?.filter(c => c.id !== checklistId);
      }
    });
  }

  addChecklistItem(checklist: Checklist) {
    const text = this.newItemTexts[checklist.id]?.trim();
    if (!text) return;
    this.checklistService.addItem({
      content: text,
      checklistId: checklist.id,
      position: checklist.items.length
    }).subscribe(res => {
      if (res.success && res.data) {
        checklist.items.push(res.data);
        this.newItemTexts[checklist.id] = '';
        this.isAddingItem[checklist.id] = false;
      }
    });
  }

  toggleChecklistItem(item: ChecklistItem) {
    this.checklistService.updateItem(item.id, { isCompleted: !item.isCompleted }).subscribe(res => {
      if (res.success) item.isCompleted = !item.isCompleted;
    });
  }

  deleteChecklistItem(checklist: Checklist, itemId: number) {
    this.checklistService.deleteItem(itemId).subscribe(res => {
      if (res.success) {
        checklist.items = checklist.items.filter(i => i.id !== itemId);
      }
    });
  }

  getChecklistProgress(checklist: Checklist): number {
    if (!checklist.items.length) return 0;
    const done = checklist.items.filter(i => i.isCompleted).length;
    return Math.round((done / checklist.items.length) * 100);
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'priority-critical';
      case 'high':     return 'priority-high';
      case 'low':      return 'priority-low';
      default:         return 'priority-medium';
    }
  }

  // ── Attachments ─────────────────────────────────────
  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file || !this.task) return;
    
    this.isUploadingAttachment = true;
    this.attachmentService.uploadAttachment(this.task.id, file).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.attachments.push(res.data);
          this.loadActivityLogs();
        }
        this.isUploadingAttachment = false;
        event.target.value = null; // reset file input
      },
      error: () => { this.isUploadingAttachment = false; }
    });
  }

  downloadAttachment(attachment: Attachment) {
    window.open(`http://4.188.1.67:5000${attachment.downloadUrl}`, '_blank');
  }

  deleteAttachment(id: number) {
    if (confirm('Are you sure you want to delete this attachment?')) {
      this.attachmentService.deleteAttachment(id).subscribe(res => {
        if (res.success) {
          this.attachments = this.attachments.filter(a => a.id !== id);
          this.loadActivityLogs();
        }
      });
    }
  }

  // ── Members Assignment ─────────────────────────────────
  toggleMembersPanel() {
    this.isMembersPanelOpen = !this.isMembersPanelOpen;
    if (this.isMembersPanelOpen && this.task) {
      this.projectService.getProjectById(this.task.projectId).subscribe(res => {
        if (res.success && res.data?.teamId) {
          this.teamService.getTeamMembers(res.data.teamId).subscribe(mRes => {
            if (mRes.success && mRes.data) this.projectMembers = mRes.data;
          });
        } else {
          this.projectMembers = [];
        }
      });
    }
  }

  isMemberAssigned(userId: number): boolean {
    return !!this.task?.assignees?.some(a => a.userId === userId);
  }

  toggleMember(member: TeamMember) {
    if (!this.task) return;
    if (this.isMemberAssigned(member.userId)) {
      this.taskService.unassignUser(this.task.id, member.userId).subscribe(res => {
        if (res.success) {
          this.task!.assignees = this.task!.assignees?.filter(a => a.userId !== member.userId);
          this.taskUpdated.emit(this.task!);
          this.loadActivityLogs();
        }
      });
    } else {
      this.taskService.assignUser(this.task.id, member.userId).subscribe(res => {
        if (res.success) {
          if (!this.task!.assignees) this.task!.assignees = [];
          this.task!.assignees.push({
            userId: member.userId,
            fullName: member.fullName,
            avatarUrl: member.avatarUrl
          });
          this.taskUpdated.emit(this.task!);
          this.loadActivityLogs();
        }
      });
    }
  }
}
