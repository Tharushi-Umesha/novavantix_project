/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Project {
    id: number;
    name: string;
    description?: string;
    created_at: string;
}


export interface Task {
    id: number;
    project_id: number;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    due_date?: string;
    assignee_user_id?: number;
    version: number;
    created_at: string;
    updated_at?: string;
    [key: string]: any; // For additional fields
}


export interface UserCreate {
    name: string;
    email: string;
    password: string;
    role?: 'member' | 'admin';
}