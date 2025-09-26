/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';
import ProjectCreateModal from '@/modals/projectCreateModal';

export default function Projects() {
    const { role } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (role === null) {
            router.push('/');
        } else {
            setLoading(false); // Set loading to false once role is available
            fetchProjects(); // Fetch projects when role is confirmed
        }
    }, [role, router]);

    const fetchProjects = async () => {
        try {
            const url = searchQuery ? `/projects?q=${encodeURIComponent(searchQuery)}` : '/projects';
            const response = await api.get(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProjects(response.data);
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Failed to fetch projects');
            if (typeof err === 'object' && err !== null) {
                const errorObj = err as { response?: { data?: any }; message?: string };
                console.error("Fetch Projects Error:", errorObj.response?.data || errorObj.message);
            } else {
                console.error("Fetch Projects Error:", err);
            }
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchProjects(); // Refetch when searchQuery changes
        }
    }, [loading, searchQuery]);

    const handleCreateProject = async (data: { name: string; description?: string }) => {
        setCreateLoading(true);
        try {
            await api.post('/projects', { name: data.name, description: data.description }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            await fetchProjects(); // Refetch projects after creation
            setError('');
        } catch (err) {
            setError('Failed to create project');
            throw err; // Re-throw to let modal handle it
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading or redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects Dashboard</h1>
                                    <p className="text-gray-600 flex items-center space-x-2">
                                        <span>Welcome,</span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${role === 'admin'
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                                            }`}>
                                            {role === 'admin' ? (
                                                <>
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                                                    </svg>
                                                    Admin
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    Member
                                                </>
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    router.push('/');
                                }}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-medium">Logout</span>
                            </button>
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

                    {/* Search Input */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search projects by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                            <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
                                <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2 py-1 rounded-full">
                                    {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                                </span>
                            </div>

                            {role === 'admin' && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Create Project</span>
                                </button>
                            )}
                        </div>

                        {/* Projects List */}
                        {projects.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                                <p className="text-gray-600 mb-4">
                                    {role === 'admin'
                                        ? 'Get started by creating your first project.'
                                        : 'Projects will appear here once they are created by an admin.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {projects.map((project: any, index: number) => (
                                    <div
                                        key={project.id}
                                        className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                    {project.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                                        {project.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Project #{index + 1}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Project Create Modal */}
            <ProjectCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
                loading={createLoading}
            />
        </>
    );
}