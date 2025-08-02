import Image from 'next/image'

const cards = [
  { img: '/cardImg1.png', title: 'Pie Chart' },
  { img: '/cardImg2.png', title: 'Linear Chart' },
  { img: '/cardImg3.png', title: 'Bar Chart' },
  { img: '/cardImg4.png', title: 'Heat Map' },
]

const Card = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 p-10 mt-5 bg-gradient-to-r from-[#dbe4f3] via-[#7886C7] to-[#5a6bb2]">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="flex flex-col items-center justify-center w-[300px] h-[400px] p-5 rounded-2xl backdrop-blur-xl border-2 border-white/30 bg-white/20 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          style={{ animationDelay: `${0.2 + index * 0.3}s`, animationFillMode: 'forwards' }}
        >
          <Image
            src={card.img}
            alt={card.title}
            width={200}
            height={200}
            className="mb-5"
          />
          <h2 className="text-lg font-medium text-black text-center">{card.title}</h2>
          <button className="mt-4 px-5 py-2 rounded-full bg-white/60 text-black hover:bg-black/10 transition">
            Pelajari Selengkapnya
          </button>
        </div>
      ))}
    </div>
  )
}

export default Card
