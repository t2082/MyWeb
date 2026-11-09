export interface Project {
  id: string;
  title: string;
  category: "mobile" | "ai" | "frontend" | "utility";
  role: string;
  time: string;
  badge: string;
  summary: string;
  description: string[];
  techStack: string[];
  links: {
    playStore?: string;
    appStore?: string;
    github?: string;
    live?: string;
  };
  metrics?: string;
  iconName: string;
}

export interface Experience {
  id: string;
  company: string;
  location: string;
  role: string;
  period: string;
  teamSize: number;
  highlight: string;
  projects: {
    name: string;
    description: string[];
    tech: string[];
    links?: {
      playStore?: string;
      appStore?: string;
      web?: string;
    };
  }[];
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: {
    name: string;
    level: number; // 1-5
    tag?: string;
  }[];
}

export const PORTFOLIO_DATA = {
  personal: {
    name: "LUONG LUU MINH TAN",
    alias: "Akuro / M.Tan",
    title: "Mobile Developer",
    subtitle: "Flutter Specialist & Cross-Platform Engineer",
    level: 24,
    hp: "100/100",
    mp: "82/100",
    class: "Flutter Alchemist / Mobile Dev",
    location: "Can Tho, Vietnam",
    address: "347, Bui Huu Nghia, Can Tho, Vietnam",
    email: "luongluuminhtan@gmail.com",
    phone: "+84 775 500 182",
    website: "https://akuro.netlify.app",
    websiteDisplay: "akuro.netlify.app",
    github: "https://github.com/t2082",
    githubDisplay: "github.com/t2082",
    avatar: "/assets/avatar_akuro.png",
    cvDownload: "/cv.pdf",
    summary:
      "Flutter Developer with 2+ years of experience building and maintaining high-performance cross-platform mobile and web applications using Flutter and Dart. Highly skilled in REST API integration, state management (BLoC, Riverpod, GetX), and Clean Architecture. Passionate about Clean Code, SOLID principles, and crafting seamless, scalable software.",
    education: {
      school: "Can Tho University",
      major: "Information Systems",
      period: "Oct 2020 – May 2024",
      gpa: "3.4 / 4.0",
      thesis: "Music Emotion Analysis Using Deep Learning Techniques",
      thesisGrade: "9.5 / 10",
    },
    certificate: {
      name: "Software Architecture",
      issuer: "Coursera",
      url: "https://coursera.org/share/dbb65c3929bea0a76f67b71a2b9e7144",
    },
    languages: [
      { name: "Vietnamese", level: "Native Proficiency" },
      { name: "English", level: "Working Proficiency" },
    ],
  },

  experiences: [
    {
      id: "senbox",
      company: "SEN:BOX Framework",
      location: "Ho Chi Minh City, Vietnam",
      role: "Mobile Developer",
      period: "Dec 2025 – Present",
      teamSize: 12,
      highlight: "Slashed CloudFront image & video operational costs by over 50% (>2x cost reduction)",
      projects: [
        {
          name: "SENBOX Mobile App",
          description: [
            "Architected, developed, and maintained core features for the SENBOX mobile application across iOS and Android, delivering responsive UI and scalable architecture.",
            "Collaborated directly with Project Managers, Technical Leaders, and cross-functional teams to design API contracts and propose product initiatives.",
            "Optimized multimedia delivery, asset compression, and caching strategies, cutting CloudFront image and video operational costs by >50%.",
            "Authored and customized native plugins (Android Kotlin & iOS Swift) via Platform Channels to fulfill unique business and hardware requirements.",
          ],
          tech: [
            "Flutter (BLoC)",
            "Kotlin",
            "Swift",
            "Clean Architecture",
            "Drift (SQLite ORM)",
            "Firebase (Crashlytics, Remote Config)",
            "WorkManager",
            "Isolate",
            "Slang (i18n)",
            "MediaKit",
            "FVM",
            "Mason CLI",
          ],
          links: {
            playStore: "https://play.google.com/store/apps/details?id=com.senbox.co.app",
            appStore: "https://apps.apple.com/app/id6742817798",
          },
        },
      ],
    },
    {
      id: "ntsoft",
      company: "NTSoft – Governmental Digital Solutions",
      location: "Vinh Long, Vietnam",
      role: "Mobile Developer",
      period: "Aug 2024 – Oct 2025",
      teamSize: 15,
      highlight: "Reduced SQL query latency from 5s to 2s; published public administrative apps",
      projects: [
        {
          name: "Food Safety Inspection (ATTP Hau Giang)",
          description: [
            "Developed public reporting modules with Google Maps API, administrative inspection workflows, and optimized SQL Server stored procedures (reducing latency from 5s to 2s).",
            "Built and published the 'ATTP Hau Giang' application on both Google Play and Apple App Store.",
          ],
          tech: ["Flutter (GetX)", "SQL Server", "Google Maps API", "CI/CD"],
          links: {
            playStore: "https://play.google.com/store/apps/details?id=com.nts.attphg",
            appStore: "https://apps.apple.com/vn/app/id6740837286",
          },
        },
        {
          name: "Digital Land Price Map (Ban Do Gia Dat)",
          description: [
            "Developed cross-platform mobile features using Flutter for land price lookups, cadastral parcel boundary GIS display via Google Maps, and interactive price trend charts with fl_chart.",
            "Engineered RESTful API integrations with high-speed local caching (SQLite) and multi-parameter search filtering.",
          ],
          tech: ["Flutter (GetX)", "Google Maps API", "SQLite", "RESTful APIs", "fl_chart"],
        },
        {
          name: "Labor Market Management (NTSOFT TTLD)",
          description: [
            "Constructed dynamic mobile survey forms with strict field validation and offline SQLite storage, enabling field officers to digitize profiles without network connectivity.",
            "Integrated labor supply-demand matching algorithms connecting job seekers with recruiting enterprises; published to Google Play.",
          ],
          tech: ["React Native (TanStack)", "SQLite", "RESTful APIs", "Offline Sync"],
          links: {
            playStore: "https://play.google.com/store/apps/details?id=com.ntsoft.ttld.bl",
          },
        },
      ],
    },
    {
      id: "satek",
      company: "Satek Solution",
      location: "Can Tho, Vietnam",
      role: "Frontend Developer / Intern",
      period: "Apr 2024 – Jul 2024",
      teamSize: 10,
      highlight: "Promoted from Manual Tester to full Frontend ownership after exceptional performance",
      projects: [
        {
          name: "Trung Muoi Quoc Viet",
          description: [
            "Started as a Manual Tester for Next.js web application and React Native mobile application, and was subsequently entrusted with full responsibility for frontend development.",
            "Engineered responsive user interfaces and integrated modern RESTful APIs using Next.js, Axios, and MySQL.",
          ],
          tech: ["React (Next.js)", "Axios", "MySQL", "Tailwind CSS"],
          links: {
            web: "https://trungmuoiquocviet.com",
          },
        },
      ],
    },
  ] as Experience[],

  projects: [
    {
      id: "senbox-app",
      title: "SENBOX Mobile App",
      category: "mobile" as const,
      role: "SEN:BOX Framework – Mobile Developer",
      time: "Dec 2025 – Present",
      badge: "Production • Store Released",
      summary: "High-performance enterprise mobile application across iOS and Android built with Flutter BLoC and Clean Architecture.",
      description: [
        "Architected, developed, and maintained core features for the SENBOX mobile application across iOS and Android, delivering responsive UI and scalable architecture.",
        "Collaborated directly with Project Managers, Technical Leaders, and cross-functional teams to design API contracts and propose product initiatives.",
        "Optimized multimedia delivery, asset compression, and caching strategies, cutting CloudFront image and video operational costs by >50%.",
        "Authored and customized native plugins (Android Kotlin & iOS Swift) via Platform Channels to fulfill unique business and hardware requirements.",
      ],
      techStack: [
        "Flutter (BLoC)",
        "Kotlin",
        "Swift",
        "Clean Architecture",
        "Drift (SQLite)",
        "Firebase",
        "WorkManager",
        "Slang (i18n)",
      ],
      links: {
        playStore: "https://play.google.com/store/apps/details?id=com.senbox.co.app",
        appStore: "https://apps.apple.com/app/id6742817798",
      },
      metrics: "App Store & Google Play • >50% CloudFront Cost Reduction",
      iconName: "smartphone",
    },
    {
      id: "self-manager-ai",
      title: "Self Manager AI",
      category: "ai" as const,
      role: "Freelance Project (Vlance) – Mobile Developer",
      time: "Sep 2025 – Nov 2025",
      badge: "AI + Productivity",
      summary: "AI-powered personal task management and user journaling application powered by Gemini API.",
      description: [
        "Engineered comprehensive to-do management, quick journaling features, and an analytical productivity dashboard.",
        "Integrated multilingual Google Gemini AI supporting natural conversational interactions with previous-message context memory, multi-language vocabulary lookup, and smart suggestions.",
        "Crafted a modern UI with three dynamic themes (morning, afternoon, evening) accompanied by automated notifications and reminders.",
      ],
      techStack: ["Flutter (Riverpod)", "Freezed", "SQLite", "Gemini API", "GitHub Actions (CI/CD)"],
      links: {
        playStore: "https://play.google.com/store/apps/details?id=com.akuro.selfmanagerai",
      },
      metrics: "3 dynamic themes • Multilingual AI with context memory",
      iconName: "brain",
    },
    {
      id: "daily-motivation",
      title: "Daily Motivation",
      category: "mobile" as const,
      role: "Personal Project – Mobile Developer",
      time: "Aug 2025 – Oct 2025",
      badge: "Widget + Media",
      summary: "Daily motivational quotes and affirmation app with Android Native Home Screen Widget and FFmpeg sharing.",
      description: [
        "Delivers fresh daily motivational quotes and positive affirmations to keep users inspired.",
        "Developed an Android Native home screen widget for instant glanceable inspiration without opening the app.",
        "Engineered seamless quote video/image export and media sharing optimized with FFmpeg in a single tap.",
        "Crafted a minimalist aesthetic with full Light/Dark mode support for a distraction-free reading experience.",
      ],
      techStack: ["Flutter (Riverpod)", "NestJS", "PostgreSQL (Supabase)", "GitHub Actions", "FFmpeg", "Android Widget"],
      links: {
        playStore: "https://play.google.com/store/apps/details?id=com.akuro.dailymotivation",
      },
      metrics: "Native Home Widget • 1-tap FFmpeg Export",
      iconName: "flame",
    },
    {
      id: "ladb-remover",
      title: "LADB Remover",
      category: "utility" as const,
      role: "Personal Project – Flutter & Android Native",
      time: "Jun 2026 – Aug 2026",
      badge: "Wireless Debugging Utility",
      summary: "Android system utility enabling users to safely uninstall and restore bloatware without PC or root access.",
      description: [
        "Allows safe uninstallation and restoration of pre-installed system bloatware applications via on-device Wireless Debugging.",
        "Direct package management on device, complete with backup and restore tracking to prevent system instability.",
        "Designed an intuitive UI with step-by-step connection guidance for non-technical users.",
      ],
      techStack: ["Flutter (Provider)", "Kotlin Native", "Hive", "ADB Protocol"],
      links: {
        github: "https://github.com/t2082/app_spec_remover",
      },
      metrics: "No Root Required • Wireless ADB Protocol",
      iconName: "shield",
    },
    {
      id: "attp-haugiang",
      title: "Food Safety Inspection (ATTP Hau Giang)",
      category: "mobile" as const,
      role: "NTSoft – Governmental Mobile App",
      time: "2024 – 2025",
      badge: "Government / Store Released",
      summary: "Public citizen reporting and administrative inspection management app for Hau Giang province.",
      description: [
        "Integrated Google Maps API for citizens to submit food safety violation reports with exact GPS coordinates.",
        "Streamlined on-site inspection logging and digital dossier updates for governmental inspection teams.",
        "Reduced query latency from 5s down to 2s; published on both Google Play and Apple App Store.",
      ],
      techStack: ["Flutter (GetX)", "SQL Server", "Google Maps API", "CI/CD"],
      links: {
        playStore: "https://play.google.com/store/apps/details?id=com.nts.attphg",
        appStore: "https://apps.apple.com/vn/app/id6740837286",
      },
      metrics: "App Store & Google Play • 60% Latency Reduction",
      iconName: "map",
    },
    {
      id: "land-price-map",
      title: "Digital Land Price Map (Ban Do Gia Dat)",
      category: "mobile" as const,
      role: "NTSoft – GIS Mobile App",
      time: "2024 – 2025",
      badge: "GIS & Land Valuation",
      summary: "Real-time cadastral land valuation, zoning boundaries, and price trend analytics app.",
      description: [
        "Enables instant lookup of digital land valuation tables and legal appraisal files on interactive Google Maps.",
        "Renders dynamic price trend analytics charts with fl_chart and local SQLite caching for sub-second retrieval.",
      ],
      techStack: ["Flutter (GetX)", "Google Maps API", "SQLite", "fl_chart", "RESTful APIs"],
      links: {},
      metrics: "Interactive GIS Boundaries • Fast SQLite Caching",
      iconName: "compass",
    },
    {
      id: "labor-market",
      title: "Labor Market Management (NTSOFT TTLD)",
      category: "mobile" as const,
      role: "NTSoft – Field Survey App",
      time: "2024 – 2025",
      badge: "Offline-First Mobile App",
      summary: "Offline-first field survey application digitizing employment profiles and job matchmaking.",
      description: [
        "Enables field officers to conduct interviews and capture employment profiles completely offline with automatic sync upon reconnection.",
        "Features automated matching algorithms pairing job seekers with suitable corporate recruiting requisitions.",
      ],
      techStack: ["React Native (TanStack)", "SQLite", "Offline Sync", "REST APIs"],
      links: {
        playStore: "https://play.google.com/store/apps/details?id=com.ntsoft.ttld.bl",
      },
      metrics: "100% Offline Capable • Store Published",
      iconName: "users",
    },
  ],

  skillCategories: [
    {
      title: "MOBILE & LANGUAGES",
      icon: "smartphone",
      skills: [
        { name: "Flutter", level: 4, tag: "Primary Weapon" },
        { name: "Dart", level: 4, tag: "Expert" },
        { name: "Kotlin", level: 3, tag: "Android Native" },
        { name: "Swift", level: 3, tag: "iOS Native" },
        { name: "React Native (Expo)", level: 3, tag: "Cross-Platform" },
        { name: "TypeScript / JS", level: 3, tag: "Web & Apps" },
      ],
    },
    {
      title: "STATE & ARCHITECTURE",
      icon: "cpu",
      skills: [
        { name: "Clean Architecture", level: 4, tag: "Core Principle" },
        { name: "BLoC Pattern", level: 4, tag: "Production Ready" },
        { name: "Riverpod", level: 4, tag: "Modern State" },
        { name: "GetX", level: 4, tag: "Rapid Delivery" },
        { name: "SOLID Principles", level: 4, tag: "Best Practices" },
        { name: "TanStack Query", level: 3, tag: "Async Data" },
      ],
    },
    {
      title: "DATABASES & BACKEND",
      icon: "database",
      skills: [
        { name: "SQLite / Drift ORM", level: 4, tag: "Local Storage" },
        { name: "Hive DB", level: 4, tag: "NoSQL Key-Value" },
        { name: "Firebase (Crashlytics, Config)", level: 4, tag: "Cloud Ops" },
        { name: "Supabase (PostgreSQL)", level: 3, tag: "Modern BaaS" },
        { name: "SQL Server / MySQL", level: 3, tag: "Relational DB" },
        { name: "RESTful API Integration", level: 4, tag: "Contract Design" },
      ],
    },
    {
      title: "DEVOPS, TOOLS & AI",
      icon: "sparkles",
      skills: [
        { name: "GitHub Actions (CI/CD)", level: 3, tag: "Automation" },
        { name: "Fastlane & FVM", level: 3, tag: "Release Flow" },
        { name: "Mason CLI & Slang (i18n)", level: 4, tag: "Productivity" },
        { name: "CloudFront Optimization", level: 4, tag: "50% Cost Cut" },
        { name: "Figma to Flutter Code", level: 4, tag: "Pixel Perfect UI" },
        { name: "Git & Version Control", level: 4, tag: "Workflow" },
      ],
    },
  ],

  rpgQuest: {
    title: "COLLABORATION QUEST",
    question: "I'm excited to collaborate with you! Would you be interested in working together?",
    options: [
      {
        id: "yes",
        text: "Yes! Let's talk about projects",
        reply: "LEVEL UP! 🌟 Let's build something phenomenal together! You can reach me via email or direct phone below.",
        action: "email",
      },
      {
        id: "resume",
        text: "Download Resume (PDF)",
        reply: "ITEM ACQUIRED: Luong_Luu_Minh_Tan_CV.pdf [Legendary Tier] 📜 Download started!",
        action: "download",
      },
      {
        id: "github",
        text: "Inspect GitHub Repositories",
        reply: "PORTAL OPENED: Teleporting to github.com/t2082 to inspect open-source projects! 🚀",
        action: "github",
      },
      {
        id: "coffee",
        text: "Maybe later (Stay connected)",
        reply: "SAVED TO QUEST LOG! ☕ Looking forward to connecting soon. You can always email me at luongluuminhtan@gmail.com!",
        action: "none",
      },
    ],
  },
};
