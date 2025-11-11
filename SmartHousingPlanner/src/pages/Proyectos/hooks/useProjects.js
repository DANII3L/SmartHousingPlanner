import { useState, useEffect, useCallback } from 'react';
import { ProjectsService } from '../../../service/projects.js';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProjectsService.list();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    loadProjects
  };
};
