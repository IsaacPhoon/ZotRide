interface CardData {
  id: number
  title: string
  description: string
}

const HomeNavCards = () => {
  const cards: CardData[] = [
    {
      id: 1,
      title: "Card 1 Title",
      description: "Card 1 description goes here\nType stuff here, have fun!",
    },
    {
      id: 2,
      title: "Button 2",
      description: "Card 1 description goes here\nType stuff here, have fun!",
    },
    {
      id: 3,
      title: "Button 3",
      description: "Card 1 description goes here\nType stuff here, have fun!",
    },
    {
      id: 4,
      title: "Button 4",
      description: "Card 1 description goes here\nType stuff here, have fun!",
    },
    {
      id: 5,
      title: "Button 5",
      description: "Card 1 description goes here\nType stuff here, have fun!",
    },
    {
      id: 6,
      title: "Button 6",
      description: "Card 1 description goes here\nType stuff here, have fun!",
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
            <p className="whitespace-pre-line text-black">{card.description}</p>
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
