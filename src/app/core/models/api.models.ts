export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roleId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt?: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  teamRole: string;
  joinedAt: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  color?: string;
  teamId?: number;
  ownerId: number;
  ownerName?: string;
  teamName?: string;
  memberCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
  status: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  columns: string[];
}

export interface Label {
  id: number;
  name: string;
  color: string;
  projectId: number;
}

export interface ChecklistItem {
  id: number;
  content: string;
  isCompleted: boolean;
  position: number;
  checklistId: number;
}

export interface Checklist {
  id: number;
  title: string;
  taskId: number;
  items: ChecklistItem[];
}

export interface UpdateTaskStatusDto {
  status: string;
  position?: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  projectId: number;
  projectName: string;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  assignees?: TaskAssignee[];
  comments?: Comment[];
  attachments?: Attachment[];
  labels?: Label[];
  checklists?: Checklist[];
  commentCount?: number;
  attachmentCount?: number;
}

export interface TaskAssignee {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  authorName?: string;
  authorAvatarUrl?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: number;
  originalFileName: string;
  fileExtension: string;
  contentType: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  taskId: number;
  uploadedByUserId: number;
  uploadedByName: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  description?: string;
  entityType?: string;
  entityId?: number;
  ipAddress?: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
