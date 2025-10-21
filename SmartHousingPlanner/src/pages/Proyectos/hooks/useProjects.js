import { useState, useEffect } from 'react';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mockProjects = [
    {
      id: 1,
      name: "Torres del Sol",
      location: "Bogotá, Colombia",
      apartments: 120,
      priceFrom: 280000000,
      image: "/api/placeholder/300/200",
      status: "En construcción",
      deliveryDate: "2025-12-01"
    },
    {
      id: 2,
      name: "Residencial Los Robles",
      location: "Medellín, Colombia", 
      apartments: 85,
      priceFrom: 320000000,
      image: "/api/placeholder/300/200",
      status: "Preventa",
      deliveryDate: "2026-06-01"
    },
    {
      id: 3,
      name: "Vista Hermosa",
      location: "Cali, Colombia",
      apartments: 200,
      priceFrom: 250000000,
      image: "/api/placeholder/300/200",
      status: "Entregado",
      deliveryDate: "2024-08-01"
    },
    {
      id: 4,
      name: "Conjunto El Prado",
      location: "Barranquilla, Colombia",
      apartments: 95,
      priceFrom: 180000000,
      image: "/api/placeholder/300/200",
      status: "Preventa",
      deliveryDate: "2025-09-01"
    },
    {
      id: 5,
      name: "Residencias Altamira",
      location: "Bucaramanga, Colombia",
      apartments: 150,
      priceFrom: 220000000,
      image: "/api/placeholder/300/200",
      status: "En construcción",
      deliveryDate: "2025-11-01"
    },
    {
      id: 6,
      name: "Torres del Norte",
      location: "Pereira, Colombia",
      apartments: 75,
      priceFrom: 195000000,
      image: "/api/placeholder/300/200",
      status: "Preventa",
      deliveryDate: "2026-03-01"
    },
    {
      id: 7,
      name: "Villa del Sol",
      location: "Manizales, Colombia",
      apartments: 110,
      priceFrom: 210000000,
      image: "/api/placeholder/300/200",
      status: "En construcción",
      deliveryDate: "2025-10-01"
    },
    {
      id: 8,
      name: "Jardines del Sur",
      location: "Neiva, Colombia",
      apartments: 60,
      priceFrom: 165000000,
      image: "/api/placeholder/300/200",
      status: "Preventa",
      deliveryDate: "2026-01-01"
    },
    {
      id: 9,
      name: "Urbanización San Martín",
      location: "Cartagena, Colombia",
      apartments: 180,
      priceFrom: 240000000,
      image: "/api/placeholder/300/200",
      status: "Entregado",
      deliveryDate: "2024-05-01"
    },
    {
      id: 10,
      name: "Conjunto Los Laureles",
      location: "Santa Marta, Colombia",
      apartments: 95,
      priceFrom: 195000000,
      image: "/api/placeholder/300/200",
      status: "Preventa",
      deliveryDate: "2026-02-01"
    },
    {
      id: 11,
      name: "Residencial El Carmen",
      location: "Ibagué, Colombia",
      apartments: 70,
      priceFrom: 170000000,
      image: "/api/placeholder/300/200",
      status: "En construcción",
      deliveryDate: "2025-08-01"
    },
    {
      id: 12,
      name: "Torres del Centro",
      location: "Armenia, Colombia",
      apartments: 120,
      priceFrom: 205000000,
      image: "/api/placeholder/300/200",
      status: "Preventa",
      deliveryDate: "2026-04-01"
    }
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProjects(mockProjects);
      setError(null);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    loadProjects
  };
};
