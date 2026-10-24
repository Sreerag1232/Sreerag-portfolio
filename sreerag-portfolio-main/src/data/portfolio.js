// Master portfolio data file for Sreerag Rajeevan
// Edit this file to update studio experience, credits, tools, or copy.

const portfolioData = {
  name: "Sreerag Rajeevan",
  titles: ["Senior Matchmove & Rotoanim Artist", "AI Filmmaker"],
  location: "Kerala / Bengaluru, India",
  linkedin: "https://www.linkedin.com/in/sreerag-rajeevan-8b0029165",
  email: "sreeragmalappattam@gmail.com",
  phone: "+91 7510185726",
  showreel: {
    title: "Senior Matchmove & Rotoanimation Showreel 2024",
    videoUrl: "showreel/sreerag_showreel_2024.mp4",
    poster: "public/assets/videos/showreel-poster.svg",
    contribution: "Senior Matchmove & Rotoanimation Artist",
    meta: "Hollywood Feature Films & Episodic VFX • 3DEqualizer & Autodesk Maya",
    description: "7 years of visual effects precision across Hollywood blockbuster features and prestige episodic series. Solves include sub-pixel 3D camera reconstruction, complex anamorphic distortion calibration, live-action plate stabilization, and precision digital double body tracking for world-class studios including DNEG and Outpost VFX."
  },

  hero: {
    title: "SREERAG RAJEEVAN",
    subhead: "Senior Matchmove & Rotoanimation Artist with 7 years of visual effects experience across Hollywood feature films and prestige episodic television.",
    stats: [
      { value: "7", label: "Years in VFX" },
      { value: "7", label: "Studios Worked With" },
      { value: "10+", label: "VFX & Tracking Tools" },
      { value: "20+", label: "Featured Titles" }
    ]
  },

  whatIDo: {
    heading: "SKILLS THAT MAKE EVERY SHOT BELIEVABLE",
    subhead: "7 years of high-end matchmove, camera tracking, and rotoanimation for Hollywood features and prestige episodic series."
  },

  experience: {
    heading: "STUDIO EXPERIENCE",
    items: [
      {
        studio: "Astra Studios",
        role: "Sr Matchmove and Rotoanim Artist",
        location: "Bengaluru",
        period: "Mar 2026 to Present",
        isCurrent: true,
        description: "Leading camera tracking, digital double rotoanimation, and integration pipelines for film and series."
      },
      {
        studio: "DNEG",
        role: "Body Track TD (Contract)",
        location: "Mumbai / Bengaluru",
        period: "Aug 2025 to Feb 2026",
        isCurrent: false,
        description: "Specialized in high-fidelity body tracking, character matchmoves, and technical camera integration."
      },
      {
        studio: "Outpost VFX",
        role: "Mid Matchmove and Rotoanim Artist",
        location: "Mumbai",
        period: "Dec 2022 to Mar 2025",
        isCurrent: false,
        description: "Delivered complex camera tracking and character rotoanimation for major Hollywood features and streaming series."
      },
      {
        studio: "Technicolor Creative Studios",
        role: "Mid Matchmove and Rotoanim Artist",
        location: "Mumbai",
        period: "Jul 2022 to Dec 2022",
        isCurrent: false,
        description: "Executed high-volume plate tracking, survey data alignment, and digital double body tracking."
      },
      {
        studio: "TMEFX",
        role: "Matchmove & Rotoanim Artist",
        location: "Trivandrum",
        period: "Apr 2021 to Jul 2022",
        isCurrent: false,
        description: "Handled object tracking, camera solve stabilization, and rotoanimation for commercial & feature plates."
      },
      {
        studio: "Trace VFX",
        role: "Junior Matchmove Rotoanim Artist",
        location: "Mumbai",
        period: "Feb 2019 to Jul 2020",
        isCurrent: false,
        description: "Camera reconstruction, body tracking, and hard-surface prop tracking across varied focal lengths."
      },
      {
        studio: "MPC",
        role: "Matchmoving and Rotoanim Apprentice",
        location: "Bangalore",
        period: "Apr 2018 to Sep 2018",
        isCurrent: false,
        description: "Intensive training in 3DEqualizer, Maya, camera tracking fundamentals, and visual effects production workflows."
      }
    ]
  },

  projects: {
    heading: "WORK ON SCREEN",
    studios: ["All", "Outpost VFX", "DNEG", "MPC Film", "TME FX", "Freelance", "Astra Studios"],
    items: [
      // Outpost VFX
      {
        id: "rings-of-power",
        title: "The Lord of the Rings: The Rings of Power",
        year: "2024",
        studio: "Outpost VFX",
        genre: "Fantasy / Adventure",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/rings-of-power.webp",
        description: "Large-scale environment camera tracking, creature matchmoving, and stereoscopic plate solving for Amazon Prime's flagship series."
      },
      {
        id: "the-lost-bus",
        title: "The Lost Bus",
        year: "2025",
        studio: "Outpost VFX",
        genre: "Drama / Thriller",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/the-lost-bus.webp",
        description: "Dynamic live-action vehicle plate tracking, emergency fire FX alignment, and high-speed camera reconstruction for Apple TV+."
      },
      {
        id: "bridgerton",
        title: "Bridgerton",
        year: "2024",
        studio: "Outpost VFX",
        genre: "Period Drama / Romance",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/bridgerton.webp",
        description: "Subtle period environment tracking, costume digital double rotoanimation, and ball sequence camera solves for Netflix."
      },
      {
        id: "hunger-games",
        title: "The Hunger Games: The Ballad of Songbirds & Snakes",
        year: "2023",
        studio: "Outpost VFX",
        genre: "Action / Sci-Fi",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/hunger-games.webp",
        description: "Arena camera tracking, complex crowds and prop alignment, and architectural plate reconstruction."
      },
      {
        id: "wicked",
        title: "Wicked for Good",
        year: "2024",
        studio: "Outpost VFX",
        genre: "Musical / Fantasy",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/wicked.webp",
        description: "Intricate body tracking, digital double alignment, and magical FX interaction plates for Universal Pictures' feature blockbuster."
      },
      {
        id: "knuckles",
        title: "Knuckles",
        year: "2024",
        studio: "Outpost VFX",
        genre: "Action / Adventure",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/knuckles.webp",
        description: "High-speed character matchmoving, creature interaction tracking, and dynamic plate camera solving for Paramount+."
      },
      {
        id: "madame-web",
        title: "Madame Web",
        year: "2024",
        studio: "Outpost VFX",
        genre: "Action / Sci-Fi",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/madame-web.webp",
        description: "Precision camera tracking for stunt sequences, CG web asset integration, and digital double rotoanimation for Columbia Pictures / Marvel."
      },
      {
        id: "foundation",
        title: "Foundation (Season 3)",
        year: "2025",
        studio: "Outpost VFX",
        genre: "Sci-Fi / Drama",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/foundation.webp",
        description: "Complex sci-fi camera trajectory reconstruction, massive spacecraft plate alignment, and character digital double rotoanimation for Apple TV+."
      },

      // DNEG
      {
        id: "dune-part-three",
        title: "Dune: Part Three",
        year: "2026",
        studio: "DNEG",
        genre: "Epic Sci-Fi",
        contribution: "Contribution: Body Track TD & Matchmove",
        poster: "public/assets/posters/dune-3.webp",
        description: "High-fidelity digital double body tracking, ornithopter & creature interaction solves, and IMAX plate tracking."
      },
      {
        id: "toxic",
        title: "Toxic: A Fairy Tale for Grown-ups",
        year: "2025",
        studio: "DNEG",
        genre: "Action / Thriller",
        contribution: "Contribution: Body Track TD",
        poster: "public/assets/posters/toxic.webp",
        description: "Technical character body tracking, high-impact stunt rotoanimation, and vehicle matchmoving for Yash's theatrical feature."
      },
      {
        id: "ramayana",
        title: "Ramayana",
        year: "2026",
        studio: "DNEG",
        genre: "Mythological Epic",
        contribution: "Contribution: Body Track TD & Matchmove",
        poster: "public/assets/posters/ramayana.webp",
        description: "Large-scale mythic creature tracking, character body solve integration, and IMAX stereo plate alignment for Namit Malhotra & Nitesh Tiwari."
      },
      {
        id: "the-odyssey",
        title: "The Odyssey",
        year: "2026",
        studio: "DNEG",
        genre: "Historical Epic",
        contribution: "Contribution: Body Track TD & Matchmove",
        poster: "public/assets/posters/the-odyssey.webp",
        description: "IMAX 70mm film camera reconstruction, armor & costume digital double alignment, and practical plate integration for Christopher Nolan's feature."
      },

      // Astra Studios (Active Productions)
      {
        id: "astra-project",
        title: "Work in Progress",
        year: "2026",
        studio: "Astra Studios",
        genre: "Confidential / Active Production",
        contribution: "Contribution: Sr Matchmove & Rotoanim",
        poster: "public/assets/posters/project-astra.svg",
        description: "Currently working on upcoming major feature film and episodic releases under strict NDA. Leading 3D camera tracking, digital double body rotoanimation, and visual effects integration pipelines.",
        isWIP: true
      },

      // MPC Film
      {
        id: "dumbo",
        title: "Dumbo",
        year: "2019",
        studio: "MPC Film",
        genre: "Fantasy / Adventure",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/dumbo.webp",
        description: "Detailed camera tracking, CG character and digital double interaction solves, and circus environment plate reconstruction for Disney & Tim Burton."
      },
      {
        id: "the-predator",
        title: "The Predator",
        year: "2018",
        studio: "MPC Film",
        genre: "Sci-Fi / Action",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/predator.webp",
        description: "Dynamic jungle camera tracking, digital double body rotoanimation, and high-speed creature stunt matchmoves for 20th Century Fox."
      },
      {
        id: "shazam",
        title: "Shazam!",
        year: "2019",
        studio: "MPC Film",
        genre: "Action / Superhero",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/shazam.webp",
        description: "Superpowered aerial flight camera reconstruction, digital double character solves, and carnival sequence plate stabilization for DC & Warner Bros."
      },
      {
        id: "doctor-dolittle",
        title: "The Voyage of Doctor Dolittle",
        year: "2020",
        studio: "MPC Film",
        genre: "Adventure / Fantasy",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/voyage-of-doctor-dolittle.webp",
        description: "Full CG creature interaction tracking, actor digital double rotoanimation, and period ship camera trajectory solving for Universal Pictures."
      },
      {
        id: "dark-phoenix",
        title: "X-Men: Dark Phoenix",
        year: "2019",
        studio: "MPC Film",
        genre: "Action / Sci-Fi",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/xmen-dark-phoenix.webp",
        description: "Space shuttle mission plate camera tracking, psychic energy FX body track alignment, and train battle sequence matchmoves for 20th Century Fox / Marvel."
      },

      // TME FX
      {
        id: "adipurush",
        title: "Adipurush",
        year: "2023",
        studio: "TME FX",
        genre: "Mythological / Epic",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/adipurush.webp",
        description: "Extensive blue-screen camera tracking, character digital double rotoanimation, and large-scale mythical battlefield plate alignment for T-Series."
      },
      {
        id: "jigarthanda-doublex",
        title: "Jigarthanda DoubleX",
        year: "2023",
        studio: "TME FX",
        genre: "Action / Period Western",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/jigarthanda.webp",
        description: "Vintage film camera reconstruction, retro anamorphic lens distortion modeling, and period action sequence character body tracking for Stone Bench Films."
      },

      // Freelance
      {
        id: "sookshmadarshini",
        title: "Sookshmadarshini",
        year: "2024",
        studio: "Freelance",
        genre: "Mystery / Comedy Drama",
        contribution: "Contribution: Matchmove & Tracking",
        poster: "public/assets/posters/sookshmadarshini.webp",
        description: "Independent visual effects camera solve, precision object tracking, and subtle invisible FX plate integration for the acclaimed feature starring Basil Joseph & Nazriya Nazim."
      },
      {
        id: "antony",
        title: "Antony",
        year: "2023",
        studio: "Freelance",
        genre: "Action / Drama",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/antony.webp",
        description: "High-impact combat sequence plate stabilization, weapon tracking, and character digital double body alignment for director Joshiy's theatrical feature."
      },
      {
        id: "aashan",
        title: "Aashan",
        year: "2024",
        studio: "Freelance",
        genre: "Drama / Period",
        contribution: "Contribution: Matchmove & Rotoanim",
        poster: "public/assets/posters/aashan.webp",
        description: "Atmospheric camera tracking, period background extension solve, and actor rotoanimation for theatrical release."
      }
    ]
  },

  aiWorks: {
    heading: "AI WORKS",
    subhead: "AI filmmaking, generative cinema, and creative commercial visual experiments.",
    instagramUrl: "https://www.instagram.com/pixelmind_by_sree/",
    instagramHandle: "@pixelmind_by_sree",
    items: [
      {
        id: "aidora-perfume",
        title: "Aidora Perfume Commercial",
        videoUrl: "public/assets/videos/aidora-perfume.mp4",
        thumbnail: "public/assets/videos/aidora-perfume-thumb.webp",
        tools: "Generative Cinema • Product Visuals",
        description: "Photorealistic generative luxury commercial featuring fluid water dynamics, natural moss forest environment, and elegant perfume bottle aesthetics."
      },
      {
        id: "kick-and-splash",
        title: "Kick & Splash Gaming Hub",
        videoUrl: "public/assets/videos/kick-and-splash.mp4",
        thumbnail: "public/assets/videos/kick-and-splash-thumb.webp",
        tools: "Architectural CGI • 3D Motion",
        description: "Dynamic architectural facade animation and playful brand visuals bringing the Kick & Splash Gaming Hub exterior to life."
      },
      {
        id: "aida-travel-1",
        title: "Aida Travel — One Trip Campaign",
        videoUrl: "public/assets/videos/aida-travels-1.mp4",
        thumbnail: "public/assets/videos/aida-travels-1-thumb.webp",
        tools: "AI Commercial • Motion Graphics",
        description: "High-energy promotional travel commercial combining live presenter footage with playful sticker cutouts, passport graphics, and AI visual effects."
      },
      {
        id: "aida-travel-2",
        title: "Aida Travel — The Real Georgia",
        videoUrl: "public/assets/videos/aida-travels-2.mp4",
        thumbnail: "public/assets/videos/aida-travels-2-thumb.webp",
        tools: "Generative Video • Visual Storytelling",
        description: "Engaging commercial campaign showcasing 'The Real Georgia Beyond Reels' with cinematic paper-texture aesthetics and storytelling."
      }
    ]
  },

  tools: {
    heading: "TECHNICAL TOOLKIT",
    vfx: [
      "Autodesk Maya",
      "3DEqualizer"
    ],
    ai: [
      "Kling",
      "Seedance",
      "VEO3",
      "ComfyUI",
      "Leonardo AI",
      "Midjourney",
      "Runway",
      "Pika",
      "Flow",
      "ElevenLabs",
      "Topaz Labs"
    ]
  },

  contact: {
    tagline: "LET'S MAKE SOMETHING CINEMATIC",
    subtext: "Available for Senior Matchmove, Body Track TD roles, and AI filmmaking collaborations worldwide.",
    email: "sreeragmalappattam@gmail.com",
    phone: "+91 7510185726",
    linkedin: "https://www.linkedin.com/in/sreerag-rajeevan-8b0029165",
    location: "Kerala / Bengaluru, India",

    // Contact form delivery. Leave formEndpoint empty and the form opens an email draft.
    // To send messages for real, paste a form service URL here (see README, "Contact form").
    //   Formspree:  formEndpoint: "https://formspree.io/f/xxxxxxxx"
    //   Web3Forms:  formEndpoint: "https://api.web3forms.com/submit", formAccessKey: "<your public key>"
    // Both values are public by design; they only allow sending mail to this inbox.
    formEndpoint: "",
    formAccessKey: ""
  },

  // Public address of the deployed site, e.g. "https://sreerag.pages.dev" (no trailing slash).
  // Used at build time for the canonical link and the share-preview image URLs.
  // Can also be set with the SITE_URL environment variable.
  siteUrl: "https://www.sreeragrajeevan.in"
};

if (typeof window !== 'undefined') {
  window.portfolioData = portfolioData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = portfolioData;
}
