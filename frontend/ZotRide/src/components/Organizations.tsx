import { useState, useEffect } from "react";
import CreateOrganization from "./CreateOrganization";
import JoinOrganization from "./JoinOrganization";
import OrganizationCard from "./OrganizationCard";
import OrganizationDetails from "./OrganizationDetails";
import { organizationAPI, type OrganizationWithMembers } from "../services/api";

const Organizations = () => {
  const [selectedOrg, setSelectedOrg] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithMembers[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizations from backend with member counts
  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationAPI.getAllOrganizations();

      // Fetch member count for each organization
      const orgsWithMembers = await Promise.all(
        orgs.map(async (org) => {
          try {
            const members = await organizationAPI.getOrganizationMembers(
              org.id
            );
            return {
              ...org,
              member_count: Array.isArray(members) ? members.length : 0,
            };
          } catch (err) {
            console.error(`Error fetching members for org ${org.id}:`, err);
            return {
              ...org,
              member_count: 0,
            };
          }
        })
      );

      setOrganizations(orgsWithMembers);
    } catch (err: any) {
      console.error("Error fetching organizations:", err);
      setError(err.response?.data?.error || "Failed to load organizations");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDetailsClick = (id: number, name: string) => {
    setSelectedOrg({ id, name });
  };

  const handleBack = () => {
    setSelectedOrg(null);
    // Refresh organizations when coming back from details
    fetchOrganizations();
  };

  // Callback for when an organization is created
  const handleOrganizationCreated = () => {
    fetchOrganizations();
  };

  // Callback for when an organization is joined
  const handleOrganizationJoined = () => {
    fetchOrganizations();
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
      <CreateOrganization onOrganizationCreated={handleOrganizationCreated} />
      <JoinOrganization onOrganizationJoined={handleOrganizationJoined} />

      {/* Organizations List Section */}
      <div className="px-[4rem] py-[4rem]">
        <h2 className="text-4xl font-bold mb-8 text-black">
          All Organizations
        </h2>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center text-2xl py-8">
            Loading organizations...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Organizations Grid */}
        {!isLoading && !error && (
          <>
            {organizations.length === 0 ? (
              <div className="text-center text-2xl py-8 text-gray-500">
                No organizations yet. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    id={org.id}
                    organizationName={org.name}
                    description={org.description || "No description provided"}
                    members={org.member_count}
                    onDetailsClick={handleDetailsClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Organizations;
