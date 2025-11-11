import React from 'react';
import HeroSection from './HeroSection';
import ProjectsSection from './ProjectsSection';
import SubsidiesSection from './SubsidiesSection';
import PurchaseSteps from './PurchaseSteps';
import ContactForm from './components/ContactForm';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ProjectsSection />
      <SubsidiesSection />
      <PurchaseSteps />
      <ContactForm />
    </>
  );
};

export default HomePage;

