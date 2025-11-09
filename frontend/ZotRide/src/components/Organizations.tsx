import { useState } from "react";
import CreateOrganization from "./CreateOrganization";
import JoinOrganization from "./JoinOrganization";
import OrganizationCard from "./OrganizationCard";
import OrganizationDetails from "./OrganizationDetails";

const Organizations = () => {
  const [selectedOrg, setSelectedOrg] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleDetailsClick = (id: number, name: string) => {
    setSelectedOrg({ id, name });
  };

  const handleBack = () => {
    setSelectedOrg(null);
  };

  // If an organization is selected, show the details page
  if (selectedOrg) {
    return (
      <OrganizationDetails
        organizationId={selectedOrg.id}
        organizationName={selectedOrg.name}
        onBack={handleBack}
      />
    );
  }

  // Otherwise, show the organizations list
  return (
    <div className="bg-white">
      <CreateOrganization />
      <JoinOrganization />

      {/* Organizations List Section */}
      <div className="px-[2rem] py-[4rem]">
        <h2 className="text-4xl font-bold mb-8 text-black">
          All Organizations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <OrganizationCard
            id={1}
            organizationName="Anteater Coders"
            description="A student organization focused on software development, hackathons, and building innovative projects together."
            members={150}
            onDetailsClick={handleDetailsClick}
          />
          <OrganizationCard
            id={2}
            organizationName="UCI Eco Club"
            description="Dedicated to promoting sustainability and environmental awareness on campus through events and initiatives."
            members={89}
            onDetailsClick={handleDetailsClick}
          />
          <OrganizationCard
            id={3}
            organizationName="Design at UCI"
            description="A community of designers passionate about UX/UI, graphic design, and creative problem solving."
            members={120}
            onDetailsClick={handleDetailsClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Organizations;
