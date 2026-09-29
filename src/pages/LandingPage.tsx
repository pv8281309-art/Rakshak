import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutUsSection } from '../components/landing/AboutUsSection';
import { DeviceSection } from '../components/landing/DeviceSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { RemoteAccidentsSection } from '../components/landing/RemoteAccidentsSection';
import { FourRolesSection } from '../components/landing/FourRolesSection';
import { ResponseNetworkSection } from '../components/landing/ResponseNetworkSection';
import { SimulationSection } from '../components/landing/SimulationSection';
import { EmergencyTimelineSection } from '../components/landing/EmergencyTimelineSection';
import { WhyRakshakSection } from '../components/landing/WhyRakshakSection';
import { MissionSection } from '../components/landing/MissionSection';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-[#0F172A] font-sans selection:bg-red-500 selection:text-white overflow-x-hidden">
      {/* 1. Navigation */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* 3. About Us Section (What is Operation Rakshak 3.0? Answers & Mission) */}
      <AboutUsSection />

      {/* 4. Device Section */}
      <DeviceSection />

      {/* 5. Problem Section - Why It Matters (01 Accident, 02 Location, 03 Response) */}
      <ProblemSection />

      {/* 6. How It Works (Continuous 5-stage timeline) */}
      <HowItWorksSection />

      {/* 7. Remote Accidents & Blind Spot Recovery (Operation Rakshak 3.2) */}
      <RemoteAccidentsSection />

      {/* 8. One Platform. Four Connected Roles. (Admin, User, Family, Hospital) */}
      <FourRolesSection />

      {/* 8. Connected Response Network (Interactive multi-node topology) */}
      <ResponseNetworkSection />

      {/* 9. Live Response Simulation (Demo / Simulated Incident Route) */}
      <SimulationSection />

      {/* 10. Emergency Response Timeline (Every second has a role) */}
      <EmergencyTimelineSection />

      {/* 11. Why Rakshak (Factual system capabilities) */}
      <MissionSection />

      {/* 12. FAQ Section (Authoritative Answers) */}
      <FAQSection />

      {/* 13. Final Conversion CTA */}
      <FinalCTASection />

      {/* 14. Footer */}
      <LandingFooter />
    </div>
  );
}
