interface CardData {
  id: number
  title: string
  description: string
}

const HomeNavCards = () => {
  const cards: CardData[] = [
    {
      id: 1,
      title: "Become a ZotDriver", // host ride if driver already
      description: "Turn your daily commute into extra income! Earn money helping Anteaters get places.",
    },
    {
      id: 2,
      title: "Go to Organizations",
      description: "The all in one hub for student org rideshares! Find rides organized by your clubs here.",
    },
    {
      id: 3,
      title: "Create an Organization",
      description: "Have your own student org? Want a rideshare system? Create your own organizations here!",
    },
    {
      id: 4,
      title: "Edit your ZotLicense",
      description: "Update your profile info and view ride history, all in one place.",
    },
    {
      id: 5,
      title: "Learn More About ZotRide",
      description: "What exactly does this webapp do? Find more about ZotRide and all it's capabilities here!",
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className="card border border-black bg-white/50 rounded-3xl"
        >
          <div className="card-body">
            <h2 className="card-title text-black font-bold">{card.title}</h2>
            <p className="whitespace-pre-line text-black w-[18rem]">{card.description}</p>
            <div className="card-actions justify-start">
              <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white">
                Let's go!
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HomeNavCards
