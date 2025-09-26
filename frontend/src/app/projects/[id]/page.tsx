/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';

// Import defined interfaces from types.ts
import { Project, Task } from '@/app/types';

// Assume these modals are created or will be created
import TaskCreateModal from '@/modals/taskCreateModal';
import TaskEditModal from '@/modals/taskEditModal';

export default function ProjectDetail() {
    const { role } = useAuth(); // Assuming useAuth provides 'role'
    const auth = useAuth();
    const user = (auth as any).user; // Access 'user' if it exists, or update based on AuthProvider
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const [projRes, tasksRes] = await Promise.all([
                    api.get(`/projects/${projectId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }),
                    api.get(`/projects/${projectId}/tasks`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }),
                ]);
                setProject(projRes.data as Project);
                setTasks(tasksRes.data as Task[]);
            } catch (err) {
                setError('Failed to load project details');
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    const handleCreateTask = async (taskData: { title: string; status?: 'todo' | 'in_progress' | 'done'; due_date?: string; assignee_user_id?: number }) => {
        try {
            const res = await api.post(`/projects/${projectId}/tasks`, taskData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setTasks([...tasks, res.data as Task]);
            setError('');
        } catch (err) {
            setError('Failed to create task');
            console.error("Create task error:", err);
            throw err;
        }
    };

    const handleUpdateTask = async (taskId: number, updates: Partial<Task>, version: number) => {
        const optimisticTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        setTasks(optimisticTasks); // Optimistic UI update

        try {
            const res = await api.patch(`/tasks/${taskId}`, { ...updates, version }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'If-Match': version },
            });
            setTasks(tasks.map(t => t.id === taskId ? res.data as Task : t)); // Update with server response
            setError('');
        } catch (err: any) {
            if (err.response?.status === 409) {
                setTasks(tasks); // Rollback on conflict
                setError('Conflict - task was updated by someone else. Reload and try again.');
            } else {
                setError('Update failed');
                setTasks(tasks); // Rollback on other errors
            }
            console.error("Update task error:", err);
        }
    };

    const handleStatusChange = async (taskId: number, newStatus: 'todo' | 'in_progress' | 'done', version: number) => {
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;

        const optimisticTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTasks(optimisticTasks);

        try {
            const res = await api.patch(`/tasks/${taskId}`, { status: newStatus, version }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'If-Match': version },
            });
            setTasks(tasks.map(t => t.id === taskId ? res.data as Task : t));
            setError('');
        } catch (err: any) {
            if (err.response?.status === 409) {
                setTasks(tasks); // Rollback on conflict
                setError('Conflict - task status was updated by someone else. Reload and try again.');
            } else {
                setError('Failed to update status');
                setTasks(tasks); // Rollback on other errors
            }
            console.error("Status update error:", err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'done':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'todo':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            case 'in_progress':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'done':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (error && !project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Project</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
                    <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
                    <button
                        onClick={() => router.push('/projects')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    const todoTasks = tasks.filter(task => task.status === 'todo');
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
    const doneTasks = tasks.filter(task => task.status === 'done');

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">
                                        {project.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                                    <p className="text-gray-600">
                                        {project.description || 'No description available'}
                                    </p>
                                </div>
                            </div>

                            {role === 'admin' && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Create Task</span>
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-600">{todoTasks.length}</div>
                                <div className="text-sm text-gray-500">To Do</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</div>
                                <div className="text-sm text-yellow-600">In Progress</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{doneTasks.length}</div>
                                <div className="text-sm text-green-600">Completed</div>
                            </div>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-3">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {/* Tasks Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                                <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2 py-1 rounded-full">
                                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                </span>
                            </div>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                                <p className="text-gray-600 mb-4">
                                    {role === 'admin'
                                        ? 'Get started by creating your first task.'
                                        : 'Tasks will appear here once they are created.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="group p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
                                                        {task.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    {/* Status Dropdown */}
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium text-gray-600">Status:</span>
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task.id, e.target.value as 'todo' | 'in_progress' | 'done', task.version)}
                                                            className={`px-3 py-1 text-xs font-medium rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(task.status)}`}
                                                            disabled={!(role === 'admin' || task.assignee_user_id === user?.id)}
                                                        >
                                                            <option value="todo">To Do</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="done">Done</option>
                                                        </select>
                                                    </div>

                                                    {/* Assignee */}
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-600">ID: {task.assignee_user_id}</span>
                                                    </div>

                                                    {/* Due Date */}
                                                    {task.due_date && (
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-600">Due: {task.due_date}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-2">
                                                {(role === 'admin' || task.assignee_user_id === user?.id) && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingTask(task);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all duration-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Edit</span>
                                                    </button>
                                                )}

                                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                                    {getStatusIcon(task.status)}
                                                    <span>
                                                        {task.status === 'todo' ? 'To Do' :
                                                            task.status === 'in_progress' ? 'In Progress' : 'Done'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TaskCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTask}
                isAdmin={role === 'admin'}
            />

            {editingTask && (
                <TaskEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSubmit={(updates) => handleUpdateTask(editingTask.id, updates, editingTask.version)}
                    task={editingTask}
                    isAdmin={role === 'admin'}
                />
            )}
        </>
    );
}