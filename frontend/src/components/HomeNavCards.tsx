import { animate } from "framer-motion";

interface CardData {
  id: number;
  title: string;
  description: string;
  navigationPage: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE";
  scrollToId?: string;
}

interface HomeNavCardsProps {
  setActivePage: (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => void;
}

const HomeNavCards = ({ setActivePage }: HomeNavCardsProps) => {
  const cards: CardData[] = [
    {
      id: 1,
      title: "Become a ZotDriver",
      description:
        "Turn your daily commute into extra income! Earn money helping Anteaters get places.",
      navigationPage: "PROFILE",
      scrollToId: "driver-application",
    },
    {
      id: 2,
      title: "Go to Organizations",
      description:
        "The all in one hub for student org rideshares! Find rides organized by your clubs here.",
      navigationPage: "ORGANIZATIONS",
    },
    {
      id: 3,
      title: "Create an Organization",
      description:
        "Have your own student org? Want a rideshare system? Create your own organizations here!",
      navigationPage: "ORGANIZATIONS",
    },
    {
      id: 4,
      title: "Edit your ZotLicense",
      description:
        "Update your profile info and view ride history, all in one place.",
      navigationPage: "PROFILE",
    },
    {
      id: 5,
      title: "Learn More About ZotRide",
      description:
        "What exactly does this webapp do? Find more about ZotRide and all it's capabilities here!",
      navigationPage: "ABOUT",
    },
  ];

  const handleNavigation = (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE",
    scrollToId?: string
  ) => {
    setActivePage(page);

    // Scroll to the section after navigation with framer-motion
    setTimeout(() => {
      const targetY = scrollToId
        ? document.getElementById(scrollToId)?.offsetTop || 0
        : 0;

      animate(window.scrollY, targetY, {
        type: "spring",
        stiffness: 100,
        damping: 20,
        onUpdate: (latest) => window.scrollTo(0, latest),
      });
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className="card border border-black bg-white/50 rounded-3xl"
        >
          <div className="card-body">
            <h2 className="card-title text-black font-bold">{card.title}</h2>
            <p className="whitespace-pre-line text-black w-[18rem]">
              {card.description}
            </p>
            <div className="card-actions justify-start">
              <button
                onClick={() =>
                  handleNavigation(card.navigationPage, card.scrollToId)
                }
                className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white"
              >
                Let's go!
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeNavCards;
