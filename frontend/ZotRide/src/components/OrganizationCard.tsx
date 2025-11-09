interface OrganizationCardProps {
  id: number;
  organizationName: string;
  description: string;
  members: number;
}

const OrganizationCard = ({
  organizationName,
  description,
  members,
}: OrganizationCardProps) => {
  return (
    <div className="card border border-black bg-white/50 rounded-3xl">
      <div className="card-body">
        <h2 className="card-title text-black font-bold text-xl">
          {organizationName}
        </h2>
        <p className="text-black line-clamp-2">{description}</p>
        <p className="text-black">{members} Members</p>
        <div className="card-actions justify-start gap-4 mt-2">
          <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6">
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
