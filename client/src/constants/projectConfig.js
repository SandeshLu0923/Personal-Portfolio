export const PROJECT_SLUGS = {
  weather: "weather-app",
  clinic: "clinic-management-system",
  operation: "operation-scheduler",
};

export const fallbackProjects = [
  {
    _id: "1",
    slug: PROJECT_SLUGS.weather,
    title: "Real-Time Weather App",
    description:
      "A modern, feature-rich weather web application built with React, Vite, and Tailwind CSS. It provides real-time weather information and air-quality data for locations around the world.",
    imageUrl:
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1000&q=80",
    techStack: ["React", "Vite", "Tailwind CSS", "Axios", "Chart.js"],
    projectUrl: "",
    githubUrl: "https://github.com/SandeshLu0923/Weather",
  },
  {
    _id: "2",
    slug: PROJECT_SLUGS.clinic,
    title: "Clinic Management System",
    description:
      "A comprehensive MERN stack clinic management system enabling seamless doctor-receptionist communication, efficient patient queue management, appointment booking, medical record maintenance, and integrated billing.",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80",
    techStack: [
      "React 19",
      "Redux Toolkit",
      "Tailwind CSS",
      "Vite",
      "Axios",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Mongoose",
      "JWT",
      "bcrypt",
    ],
    projectUrl: "https://clinic-management-theta-one.vercel.app",
    githubUrl: "https://github.com/SandeshLu0923/Clinic-management",
  },
  {
    _id: "3",
    slug: PROJECT_SLUGS.operation,
    title: "Operation Scheduler For Hospital Management",
    description:
      "Operation Scheduler is a MERN-stack hospital OT (Operation Theater) scheduling system. It supports dynamic scheduling (additions, cancellation, postponement, emergency), resource tracking, pre/post-op events, reports upload, and OT monitoring dashboards.",
    imageUrl:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80",
    techStack: [
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "Socket.IO",
      "React",
      "Vite",
      "Helmet",
      "CORS",
      "Rate Limiting",
      "JWT Auth",
      "Winston",
      "Morgan",
    ],
    projectUrl: "https://operation-scheduler-client-cms822ewk-sandeshlu0923s-projects.vercel.app",
    githubUrl: "https://github.com/SandeshLu0923/Operation-Scheduler",
  },
];

export const sections = ["home", "about", "projects", "contact"];

export const clinicRoleButtons = [
  { key: "doctor", label: "Doctor Screenshots" },
  { key: "receptionist", label: "Receptionist Screenshots" },
  { key: "patient", label: "Patient Screenshots" },
];

export const operationRoleButtons = [
  { key: "admin", label: "Admin Screenshots" },
  { key: "anesthesiologist", label: "Anesthesiologist Screenshots" },
  { key: "surgeon", label: "Surgeon Screenshots" },
  { key: "nurse", label: "Nurse Screenshots" },
];

export const defaultForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};
