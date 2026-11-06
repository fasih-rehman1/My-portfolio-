/* ==========================================================
   PORTFOLIO CONTENT — edit this file to update the website.
   Everything on the page is generated from this object.
   Files (images, PDFs) go in public/assets/ and are referenced
   here as "assets/...".
   ========================================================== */
const PORTFOLIO = {
  name: "Fasih ur Rehman",
  role: "Backend & Full-Stack Developer",
  degree: "BS Computer Science graduate · The Islamia University of Bahawalpur",
  location: "Bahawalpur, Pakistan",
  photo: "assets/img/fasih-portrait.jpg",
  intro:
    "I build the parts of software people rely on but rarely see — APIs, databases, authentication, payments and automations — with Python, Django and React.",

  about: [
    "I'm a Computer Science graduate from the Islamia University of Bahawalpur (CGPA 3.70) and a backend-focused full-stack developer.",
    "At Bloggers Brackets I design and build backend systems with Django and Django REST Framework: API development, database design, authentication, payment integrations and cloud-based applications.",
    "At Technest Nova I work as a full-stack developer and team lead — managing projects, coordinating developers and shipping products such as Maharat, a skilled-worker marketplace app."
  ],

  // CV: `file` is the PDF for download, `pages` are images shown in the in-page viewer.
  // Leave file "" to hide both CV buttons.
  cv: {
    file: "assets/Fasih-ur-Rehman-CV.pdf",
    pages: ["assets/cv/fasih-cv-page-1.jpg", "assets/cv/fasih-cv-page-2.jpg"]
  },

  // The panel shown while the 3D points come together.
  whatIBuild: [
    { title: "Backend systems & REST APIs", text: "Django, Django REST Framework, FastAPI and PostgreSQL" },
    { title: "Full-stack web applications", text: "React frontends on secure, well-structured APIs" },
    { title: "Integrations & automation", text: "Authentication, payments and third-party services" }
  ],

  email: "fasihurrehman7283@gmail.com",
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/fasih-ur-rehman-501baa386/" },
    { label: "GitHub", url: "https://github.com/fasih-rehman1" }
  ],

  // Highlights shown under About
  facts: [
    { label: "Currently", value: "Backend Developer at Bloggers Brackets" },
    { label: "Leading", value: "Team Lead & Full-Stack Developer at Technest Nova" },
    { label: "Core stack", value: "Python · Django · DRF · React" }
  ],

  /* Projects. For screenshots: put images in public/assets/projects/
     and list them in `images`, e.g. ["assets/projects/retreat-home.jpg"].
     With no images, a styled browser-frame preview is shown instead. */
  projects: [
    {
      title: "Retreat Worldwide",
      kind: "Live website",
      summary:
        "A web platform for discovering retreats around the world, with retreats grouped by theme.",
      points: [
        "Built as a modern single-page React application",
        "Data-driven sections such as Discover by Theme",
        "Deployed and live in production"
      ],
      stack: ["React", "JavaScript", "REST API"],
      url: "https://retreatworldwide.com",
      link: "https://retreatworldwide.com",
      linkLabel: "Visit website",
      images: []
    },
    {
      title: "Maharat",
      kind: "Mobile app · Technest Nova",
      summary:
        "A marketplace app that connects customers with skilled workers — electricians, plumbers, carpenters, painters, technicians and labour contractors.",
      points: [
        "Developer on the Technest Nova product team",
        "Customer, worker and contractor roles with job posting, offers and bookings",
        "Location-based matching so jobs reach nearby workers"
      ],
      stack: ["Flutter", "FastAPI", "PostgreSQL", "REST API"],
      link: "",
      // App screenshots: put them in public/assets/projects/maharat/ and list them here,
      // e.g. ["assets/projects/maharat/home.jpg", "assets/projects/maharat/booking.jpg"]
      device: "phone",
      // First three are shown in the showcase; all open in the viewer
      images: [
        "assets/projects/maharat/maharat-language.jpg",
        "assets/projects/maharat/maharat-home.jpg",
        "assets/projects/maharat/maharat-worker-home.jpg",
        "assets/projects/maharat/maharat-request.jpg",
        "assets/projects/maharat/maharat-responses.jpg",
        "assets/projects/maharat/maharat-directory.jpg",
        "assets/projects/maharat/maharat-verify.jpg"
      ]
    },
    {
      title: "GigCloud",
      kind: "Final year project · Freelance marketplace",
      summary:
        "A web-based freelance portfolio and service marketplace. Freelancers build professional portfolios and publish services called gigs; clients search verified profiles and hire directly.",
      overview:
        "Unlike bidding-based platforms, GigCloud focuses on portfolio presentation, transparency, direct hiring and verified talent. Freelancers grow their visibility online, and clients hire based on real project history and authentic portfolios.",
      points: [
        "Role-based accounts for freelancers and clients with secure Django authentication",
        "Portfolios with projects, skills, certifications, experience and resume upload",
        "Gigs with skill tags, hourly pricing, delivery time and availability status",
        "Client–freelancer chat with booking proposals, counter-offers, approval and release",
        "Notifications, ratings and reviews after completed bookings",
        "Admin panel to manage users, reviews and spam prevention"
      ],
      stack: ["Python", "Django", "SQLite", "Bootstrap 5", "JavaScript (AJAX)"],
      link: "https://github.com/fasih-rehman1/GIGCLOUD",
      images: []
    },
    {
      title: "ShopWithFasih — E-Commerce App",
      kind: "Full-stack web app · React",
      summary:
        "An online store built with React, with full create, read, update and delete (CRUD) product management backed by Firebase.",
      points: [
        "Product catalogue, product pages and shopping cart in React",
        "Add, edit and delete products through a CRUD admin flow",
        "Firebase integration for data storage and real-time updates"
      ],
      stack: ["React", "JavaScript", "Firebase", "Vite"],
      link: "https://github.com/fasih-rehman1/ecommerce-app",
      images: []
    }
  ],

  // Shown after the project list
  moreWork: {
    title: "More projects on GitHub",
    text: "These are a few highlights. Explore the rest of my repositories, code and activity on GitHub, or connect on LinkedIn.",
    links: [
      { label: "Explore my GitHub", url: "https://github.com/fasih-rehman1" },
      { label: "Connect on LinkedIn", url: "https://www.linkedin.com/in/fasih-ur-rehman-501baa386/" }
    ]
  },

  // Newest first
  experience: [
    {
      role: "Backend Developer — Automation & Full Stack",
      org: "Bloggers Brackets, Bahawalpur",
      period: "Oct 2025 – Present",
      text:
        "Designing and developing robust backend solutions with Django and Django REST Framework.",
      points: [
        "API development, database management and authentication systems",
        "Payment integrations and cloud-based applications",
        "Automation and AI-assisted workflows for scalable software"
      ]
    },
    {
      role: "Full-Stack Developer & Team Lead",
      org: "Technest Nova",
      period: "Present",
      text:
        "Full-stack development, project management and team leadership for client and in-house products.",
      points: [
        "Lead developers and plan delivery across projects",
        "Developer on Maharat, the company's skilled-worker marketplace app",
        "Manage scope, timelines and client communication"
      ]
    },
    {
      role: "Software Development Fellow (Intern)",
      org: "Click Chain Academy, Bahawalpur",
      period: "Sep 2025 – Nov 2025",
      text:
        "A 12-week intensive fellowship combining technical training, teamwork and real client projects.",
      points: [
        "Built full-stack web apps with Python (Django), FastAPI and React",
        "Worked in Agile teams on real client-based projects in the final month",
        "Daily kata sessions, TDD, API integration, Git and deployment pipelines"
      ]
    },
    {
      role: "Lead Generation Specialist",
      org: "Freelance",
      period: "Oct 2023 – May 2024",
      text:
        "Researched and built targeted lead lists for clients.",
      points: [
        "Web data scraping, data mining and contact extraction",
        "Google Sheets, CRM and WordPress data entry",
        "List building and lead list delivery"
      ]
    },
    {
      role: "Peacebuilding Contributor",
      org: "Bahawalpur Lawyers Peace Group (BLPG)",
      period: "Oct 2021 – Mar 2024",
      text: "Contributed to community peace-building initiatives.",
      points: []
    }
  ],

  education: [
    {
      title: "Bachelor of Science in Computer Science",
      org: "The Islamia University of Bahawalpur",
      period: "2022 – 2026",
      note: "CGPA 3.70",
      photo: "assets/img/fasih-graduation-cutout.webp"
    },
    {
      title: "Intermediate (Pre-Engineering)",
      org: "Govt. Postgraduate and Degree College Bahawalpur",
      period: "2020 – 2022"
    },
    {
      title: "Matriculation (Science)",
      org: "Govt. Shuhada-E-APS Memorial Higher Secondary School",
      period: "2018 – 2020"
    }
  ],

  /* Certificates: `image` is shown in the viewer, `file` is the original to download. */
  certificates: [
    {
      title: "Software Development Fellowship",
      issuer: "Click Chain Academy",
      year: "Sep – Nov 2025",
      details: "12-week fellowship program, signed by the founder of Click Chain Academy.",
      image: "assets/certificates/clickchain-fellowship.jpg",
      file: "assets/certificates/clickchain-fellowship.jpg"
    },
    {
      title: "Basics of Python",
      issuer: "UniAthena · Cambridge International Qualifications, UK",
      year: "21 Sep 2024",
      details: "Delivered by UniAthena in partnership with Cambridge International Qualifications (CIQ), UK. Blockchain-verified.",
      verifyId: "9449-5366-6420",
      image: "assets/certificates/uniathena-basics-of-python.jpg",
      file: "assets/certificates/uniathena-basics-of-python.pdf"
    },
    {
      title: "e-Rozgaar Technical Track — Web Development & Freelancing",
      issuer: "e-Rozgaar · PITB & Government of the Punjab",
      year: "Nov 2022 – Jan 2023",
      details: "Completed at the Islamia University of Bahawalpur Center (8 Nov 2022 – 27 Jan 2023).",
      image: "assets/certificates/e-rozgaar-technical-track.jpg",
      file: "assets/certificates/e-rozgaar-technical-track.pdf"
    }
  ],

  skillsIntro: "The languages, frameworks, tools and practices I use to design, build and ship production software.",
  skills: [
    {
      group: "Backend Development",
      icon: "server",
      text: "Secure, scalable server-side applications and APIs.",
      items: ["Python", "Django", "Django REST Framework", "FastAPI", "RESTful API design", "Django ORM", "Authentication & authorization", "Payment gateway integration"]
    },
    {
      group: "Frontend Development",
      icon: "layout",
      text: "Responsive interfaces connected to real APIs.",
      items: ["React", "JavaScript (ES6+)", "HTML5", "CSS3", "Bootstrap", "AJAX", "Responsive design", "WordPress"]
    },
    {
      group: "Databases & Data",
      icon: "database",
      text: "Modelling, storing and querying application data.",
      items: ["SQL", "PostgreSQL", "SQLite", "Firebase", "Database design", "Data scraping & extraction"]
    },
    {
      group: "DevOps & Tools",
      icon: "tools",
      text: "Version control, testing and getting code to production.",
      items: ["Git & GitHub", "CI/CD & deployment pipelines", "Cloud deployment", "Postman (API testing)", "VS Code", "Microsoft Office"]
    },
    {
      group: "Engineering Practices",
      icon: "code",
      text: "How I write code that teams can maintain.",
      items: ["Object-oriented programming", "Data structures & algorithms", "Test-Driven Development", "Agile / Scrum", "Debugging", "Clean code & best practices"]
    },
    {
      group: "AI & Automation",
      icon: "spark",
      text: "Automating workflows and building AI-powered features.",
      items: ["Workflow automation", "AI agents", "AI-powered applications", "Third-party API integration"]
    },
    {
      group: "Leadership & Professional",
      icon: "people",
      text: "Leading delivery from planning to handover.",
      items: ["Team leadership", "Project management", "Client communication", "Problem solving", "Planning & organisation", "English & Urdu"]
    }
  ]
};

export default PORTFOLIO;
