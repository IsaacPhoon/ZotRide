import CreateOrganization from "./CreateOrganization";
import JoinOrganization from "./JoinOrganization";
import OrganizationCard from "./OrganizationCard";
import OrganizationFunctions from "./OrganizationFunctions";

const Organizations = () => {
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
          />
          <OrganizationCard
            id={2}
            organizationName="UCI Eco Club"
            description="Dedicated to promoting sustainability and environmental awareness on campus through events and initiatives."
            members={89}
          />
          <OrganizationCard
            id={3}
            organizationName="Design at UCI"
            description="A community of designers passionate about UX/UI, graphic design, and creative problem solving."
            members={120}
          />
        </div>
        <OrganizationFunctions />
      </div>
    </div>
  );
};

export default Organizations;
