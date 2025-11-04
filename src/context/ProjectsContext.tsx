import { createContext, useContext, useState, ReactNode } from 'react';
import { Project, ProjectType } from '../types/customer';

interface ProjectsContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (projectId: string, projectData: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
  getProjectsByCustomerId: (customerId: string) => Project[];
  searchProjects: (query: string) => Project[];
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Mock data inicial - en producción vendría de MongoDB
const mockProjects: Project[] = [
  {
    id: 'project-1',
    customerId: 'customer-1',
    name: 'Sistema de Gestión Web',
    description: 'Desarrollo de sistema web para gestión de inventario',
    type: 'software_development',
    status: 'active',
    startDate: new Date('2025-01-20'),
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-10-20')
  },
  {
    id: 'project-2',
    customerId: 'customer-1',
    name: 'Campaña Q4 2025',
    description: 'Campaña de marketing digital para el cuarto trimestre',
    type: 'marketing_campaign',
    status: 'active',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-10-20')
  },
  {
    id: 'project-3',
    customerId: 'customer-2',
    name: 'Consultoría Estratégica',
    description: 'Consultoría en transformación digital',
    type: 'consulting',
    status: 'active',
    startDate: new Date('2025-02-15'),
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-10-22')
  },
  {
    id: 'project-4',
    customerId: 'customer-3',
    name: 'Soporte Técnico Mensual',
    description: 'Soporte técnico y mantenimiento continuo',
    type: 'support',
    status: 'active',
    startDate: new Date('2025-03-10'),
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-10-19')
  }
];

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (projectId: string, projectData: Partial<Project>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, ...projectData, updatedAt: new Date() }
        : project
    ));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const getProjectById = (projectId: string) => {
    return projects.find(project => project.id === projectId);
  };

  const getProjectsByCustomerId = (customerId: string) => {
    return projects.filter(project => project.customerId === customerId);
  };

  const searchProjects = (query: string) => {
    if (!query.trim()) return projects;

    const lowerQuery = query.toLowerCase();
    return projects.filter(project =>
      project.name.toLowerCase().includes(lowerQuery) ||
      project.description?.toLowerCase().includes(lowerQuery) ||
      project.customerId.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <ProjectsContext.Provider value={{
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProjectById,
      getProjectsByCustomerId,
      searchProjects
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

