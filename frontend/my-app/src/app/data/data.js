export const flightIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 512 512"
      aria-label="Find Flights"
    >
      <path
        fill="currentColor"
        d="M407.72 208c-2.72 0-14.44.08-18.67.31l-57.77 1.52L198.06 48h-62.81l74.59 164.61l-97.31 1.44L68.25 160H16.14l20.61 94.18c.15.54.33 1.07.53 1.59a.26.26 0 0 1 0 .15a15 15 0 0 0-.53 1.58L15.86 352h51.78l45.45-55l96.77 2.17L135.24 464h63l133-161.75l57.77 1.54c4.29.23 16 .31 18.66.31c24.35 0 44.27-3.34 59.21-9.94C492.22 283 496 265.46 496 256c0-30.06-33-48-88.28-48m-71.29 87.9"
      />
    </svg>
  )

export const staryellow = (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="#FFCD29" d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"></path></svg>)
export const starblack = (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="#3b3434" d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"></path></svg>)
export const staysIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 512 512"
      aria-label="Find Stays"
    >
      <path
        fill="currentColor"
        d="M432 230.7a79.4 79.4 0 0 0-32-6.7H112a79.5 79.5 0 0 0-32 6.69A80.09 80.09 0 0 0 32 304v112a16 16 0 0 0 32 0v-8a8.1 8.1 0 0 1 8-8h368a8.1 8.1 0 0 1 8 8v8a16 16 0 0 0 32 0V304a80.09 80.09 0 0 0-48-73.3M376 80H136a56 56 0 0 0-56 56v72a4 4 0 0 0 5.11 3.84A95.5 95.5 0 0 1 112 208h4.23a4 4 0 0 0 4-3.55A32 32 0 0 1 152 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h24.46a4 4 0 0 0 4-3.55A32 32 0 0 1 304 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h4.2a95.5 95.5 0 0 1 26.89 3.85A4 4 0 0 0 432 208v-72a56 56 0 0 0-56-56"
      />
    </svg>
  );

export const planePaper = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 512 512"
    >
      <path
        fill="currentColor"
        d="M496 16L15.88 208L195 289L448 64L223 317l81 179z"
      ></path>
    </svg>
  );

export  const reviews = [
  {
    img: "/flightsImage.jpg",
    title: "“A real sense of community, nurtured”",
    details1:
      "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping me always,",
    details2:
      " even when I was out of the country. And always available when needed.",
    starCount: 4,
    Source: "Olga",
    workAt: "Weave Studios – Kai Tak",
  },
  {
    img: "/flightsImage.jpg",
    title: "“The facilities are superb. Clean, slick, bright.”",
    details1:
      "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping me always,",
    details2:
      " even when I was out of the country. And always available when needed.",
    starCount: 5,
    Source: "Olga",
    workAt: "Weave Studios – Kai Tak",
  },
  {
    img: "/flightsImage.jpg",
    title: "“A real sense of community, nurtured”",
    details1:
      "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping me always,",
    details2:
      "even when I was out of the country. And always available when needed.",
    starCount: 5,
    Source: "Olga",
    workAt: "Weave Studios – Kai Tak",
  },
];

export  const navLinks = [
  {
    title: "Find Flights",
    link: "/Flights",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 512 512"
        aria-label="Find Flights"
      >
        <path
          fill="currentColor"
          d="M407.72 208c-2.72 0-14.44.08-18.67.31l-57.77 1.52L198.06 48h-62.81l74.59 164.61l-97.31 1.44L68.25 160H16.14l20.61 94.18c.15.54.33 1.07.53 1.59a.26.26 0 0 1 0 .15a15 15 0 0 0-.53 1.58L15.86 352h51.78l45.45-55l96.77 2.17L135.24 464h63l133-161.75l57.77 1.54c4.29.23 16 .31 18.66.31c24.35 0 44.27-3.34 59.21-9.94C492.22 283 496 265.46 496 256c0-30.06-33-48-88.28-48m-71.29 87.9"
        />
      </svg>
    ),
  },
  {
    title: "Find Stays",
    link: "/Hotels",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 512 512"
        aria-label="Find Stays"
      >
        <path
          fill="currentColor"
          d="M432 230.7a79.4 79.4 0 0 0-32-6.7H112a79.5 79.5 0 0 0-32 6.69A80.09 80.09 0 0 0 32 304v112a16 16 0 0 0 32 0v-8a8.1 8.1 0 0 1 8-8h368a8.1 8.1 0 0 1 8 8v8a16 16 0 0 0 32 0V304a80.09 80.09 0 0 0-48-73.3M376 80H136a56 56 0 0 0-56 56v72a4 4 0 0 0 5.11 3.84A95.5 95.5 0 0 1 112 208h4.23a4 4 0 0 0 4-3.55A32 32 0 0 1 152 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h24.46a4 4 0 0 0 4-3.55A32 32 0 0 1 304 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h4.2a95.5 95.5 0 0 1 26.89 3.85A4 4 0 0 0 432 208v-72a56 56 0 0 0-56-56"
        />
      </svg>
    ),
  },
];


  export const offers = [
    {
      bgImg: "/louvre.jpg",
      location: "Melbourne",
      description: "An amazing journey",
      prevPrice: "950",
      newPrice: "799",
    },
    {
      bgImg: "/parisNight.png",
      location: "Paris",
      description: "A Paris Adventure",
      prevPrice: "700",
      newPrice: "600",
    },
    {
      bgImg: "/louvre.jpg",
      location: "London",
      description: "London eye adventure",
      prevPrice: "500",
      newPrice: "350",
    },
    {
      bgImg: "/louvre.jpg",
      location: "Columbia",
      description: "Amazing streets",
      prevPrice: "800",
      newPrice: "700 ",
    },
  ];
  










export const packs = [
    {
      bgImg: "/louvre.jpg",
      title: "tropical Paradise in the Maldives",
      description: "Relax in overwater bungalows with all-inclusive luxury.",
      prevPrice: "950",
      newPrice: "799",
      link:'/'
    },
    {
      bgImg: "/parisNight.png",
      title: "Wildlife Safari Adventure",
      description: "7 days of thrilling wildlife encounters in Kenya.",
      prevPrice: "700",
      newPrice: "600",
      link:'/'
    },
    {
      bgImg: "/louvre.jpg",
      title: "Romantic Paris Escape",
      description: "5 days of culture, cuisine, and iconic landmarks.",
      prevPrice: "500",
      newPrice: "350",
      link:'/'
    },
    {
      bgImg: "/parisNight.png",
      title: "Wildlife Safari Adventure",
      description: "7 days of thrilling wildlife encounters in Kenya.",
      prevPrice: "700",
      newPrice: "600",
      link:'/'
    },
  ];

export const destPop = [
    { bgImg: "/paris.jpg", location: "Paris, France" },
    { bgImg: "/paris.jpg", location: "Tokyo, Japan" },
    { bgImg: "/paris.jpg", location: "Istanbul, Turkey" },
    { bgImg: "/paris.jpg", location: "Baku, Azerbaijan" },
    { bgImg: "/paris.jpg", location: "Algiers, Algeria" },
    { bgImg: "/paris.jpg", location: "Rome, Italy" },
    { bgImg: "/paris.jpg", location: "Moscow, Russia" },
  ];