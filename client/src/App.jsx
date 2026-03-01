import { useEffect, useMemo, useRef, useState } from "react";
import ProjectModal from "./components/ProjectModal";
import {
  PROJECT_SLUGS,
  clinicRoleButtons,
  defaultForm,
  fallbackProjects,
  operationRoleButtons,
  sections,
} from "./constants/projectConfig";
import { fetchJson } from "./utils/fetchJson";
import { getProjectSlug } from "./utils/projectUtils";
import "./App.css";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState(fallbackProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const [activeClinicRole, setActiveClinicRole] = useState("doctor");
  const [activeClinicImageIndex, setActiveClinicImageIndex] = useState(0);
  const [clinicScreensByRole, setClinicScreensByRole] = useState({
    doctor: [],
    receptionist: [],
    patient: [],
  });

  const [activeOperationRole, setActiveOperationRole] = useState("admin");
  const [activeOperationImageIndex, setActiveOperationImageIndex] = useState(0);
  const [operationScreensByRole, setOperationScreensByRole] = useState({
    admin: [],
    anesthesiologist: [],
    surgeon: [],
    nurse: [],
  });

  const [weatherImages, setWeatherImages] = useState([]);
  const [activeWeatherImageIndex, setActiveWeatherImageIndex] = useState(0);
  const clinicRequestedRef = useRef(new Set());
  const operationRequestedRef = useRef(new Set());
  const weatherRequestedRef = useRef(false);

  const year = useMemo(() => new Date().getFullYear(), []);
  const selectedProjectSlug = getProjectSlug(selectedProject);
  const isClinicProject = selectedProjectSlug === PROJECT_SLUGS.clinic;
  const isWeatherProject = selectedProjectSlug === PROJECT_SLUGS.weather;
  const isOperationProject = selectedProjectSlug === PROJECT_SLUGS.operation;

  const clinicImagesForRole = isClinicProject ? clinicScreensByRole[activeClinicRole] || [] : [];
  const activeClinicImage = clinicImagesForRole[activeClinicImageIndex] || null;

  const operationImagesForRole = isOperationProject
    ? operationScreensByRole[activeOperationRole] || []
    : [];
  const activeOperationImage = operationImagesForRole[activeOperationImageIndex] || null;
  const activeWeatherImage = weatherImages[activeWeatherImageIndex] || null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.5 },
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await fetchJson(`${apiBase}/api/projects`);
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      } catch {
        setProjects(fallbackProjects);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
        setShowImageViewer(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;

    setShowImageViewer(false);

    if (isClinicProject) {
      clinicRequestedRef.current = new Set();
      setActiveClinicRole("patient");
      setActiveClinicImageIndex(0);
      setClinicScreensByRole({ doctor: [], receptionist: [], patient: [] });
      return;
    }

    if (isWeatherProject) {
      weatherRequestedRef.current = false;
      setWeatherImages([]);
      setActiveWeatherImageIndex(0);
      return;
    }

    if (isOperationProject) {
      operationRequestedRef.current = new Set();
      setActiveOperationRole("admin");
      setActiveOperationImageIndex(0);
      setOperationScreensByRole({
        admin: [],
        anesthesiologist: [],
        surgeon: [],
        nurse: [],
      });
    }
  }, [selectedProject, isClinicProject, isWeatherProject, isOperationProject]);

  useEffect(() => {
    if (!isClinicProject || !showImageViewer) return;

    const loadRoleImages = async (role) => {
      try {
        const data = await fetchJson(`${apiBase}/api/screenshots/clinic/${role}`);
        if (!Array.isArray(data?.images)) return;
        setClinicScreensByRole((prev) => ({ ...prev, [role]: data.images }));
      } catch {
        setClinicScreensByRole((prev) => ({ ...prev, [role]: [] }));
      }
    };

    clinicRoleButtons.forEach((role) => {
      if (clinicScreensByRole[role.key].length > 0) return;
      if (clinicRequestedRef.current.has(role.key)) return;
      clinicRequestedRef.current.add(role.key);
      loadRoleImages(role.key);
    });
  }, [showImageViewer, isClinicProject, clinicScreensByRole]);

  useEffect(() => {
    if (!isOperationProject || !showImageViewer) return;

    const loadRoleImages = async (role) => {
      try {
        const data = await fetchJson(`${apiBase}/api/screenshots/operation/${role}`);
        if (!Array.isArray(data?.images)) return;
        setOperationScreensByRole((prev) => ({ ...prev, [role]: data.images }));
      } catch {
        setOperationScreensByRole((prev) => ({ ...prev, [role]: [] }));
      }
    };

    operationRoleButtons.forEach((role) => {
      if (operationScreensByRole[role.key].length > 0) return;
      if (operationRequestedRef.current.has(role.key)) return;
      operationRequestedRef.current.add(role.key);
      loadRoleImages(role.key);
    });
  }, [showImageViewer, isOperationProject, operationScreensByRole]);

  useEffect(() => {
    if (!isWeatherProject || !showImageViewer) return;
    if (weatherRequestedRef.current) return;
    weatherRequestedRef.current = true;

    const loadWeatherImages = async () => {
      try {
        const data = await fetchJson(`${apiBase}/api/screenshots/weather`);
        if (!Array.isArray(data?.images)) return;
        setWeatherImages(data.images);
        setActiveWeatherImageIndex(0);
      } catch {
        setWeatherImages([]);
      }
    };

    loadWeatherImages();
  }, [showImageViewer, isWeatherProject]);

  const closeModal = () => {
    setSelectedProject(null);
    setShowImageViewer(false);
  };

  const toggleImageViewer = () => {
    setShowImageViewer((prev) => !prev);

    if (!showImageViewer && isClinicProject) {
      setActiveClinicRole("patient");
      setActiveClinicImageIndex(0);
    }

    if (!showImageViewer && isOperationProject) {
      setActiveOperationRole("admin");
      setActiveOperationImageIndex(0);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitStatus({ type: "", message: "" });
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!formData.subject.trim()) errors.subject = "Subject is required.";
    if (!formData.message.trim()) errors.message = "Message is required.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await fetchJson(
        `${apiBase}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
        12000,
      );

      setSubmitStatus({
        type: result?.warning ? "warning" : "success",
        message: result?.message || "Message sent successfully.",
      });
      setFormData(defaultForm);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveClinicImage = (direction) => {
    if (clinicImagesForRole.length === 0) return;
    setActiveClinicImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % clinicImagesForRole.length;
      return (prev - 1 + clinicImagesForRole.length) % clinicImagesForRole.length;
    });
  };

  const moveWeatherImage = (direction) => {
    if (weatherImages.length === 0) return;
    setActiveWeatherImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % weatherImages.length;
      return (prev - 1 + weatherImages.length) % weatherImages.length;
    });
  };

  const moveOperationImage = (direction) => {
    if (operationImagesForRole.length === 0) return;
    setActiveOperationImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % operationImagesForRole.length;
      return (prev - 1 + operationImagesForRole.length) % operationImagesForRole.length;
    });
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="container nav-wrapper">
          <a href="#home" className="brand">
            <span>Portfolio</span>
          </a>
          <button className="menu-toggle" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle navigation" type="button">
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav className={`site-nav ${menuOpen ? "open" : ""}`}>
            {sections.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {id[0].toUpperCase() + id.slice(1)}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Full Stack Developer</p>
              <h1>Sandesh P</h1>
              <p className="intro">
                MCA student passionate about building scalable web applications. Full Stack Developer specializing in the MERN stack. Constantly exploring new ways to optimize code with JavaScript and Python.
              </p>
              <div className="hero-actions">
                <a href="#projects" className="btn btn-primary">View Projects</a>
                <a href="/Resume.pdf" target="_blank" rel="noreferrer" className="btn btn-secondary">Open Resume</a>
                <a href="/Resume.pdf" download className="btn btn-secondary">Download Resume</a>
              </div>
            </div>
            <div className="profile-card">
              <img src="/profile.jpeg" alt="Sandesh P profile photo" loading="lazy" />
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container">
            <h2>About Me</h2>
            <p className="about-intro">
              I am an MCA student and Full Stack Developer who enjoys building scalable, production-ready MERN applications. My current focus includes a full-stack Clinic Management System and a weather application that integrates real-time data. I continuously refine my approach using JavaScript and Python to turn business ideas into reliable, user-friendly products.
            </p>
            <div className="about-grid">
              <article className="card">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80" alt="Students studying in classroom" className="about-card-image" loading="lazy" />
                <h3>Education</h3>
                <p>Graduated with a Bachelor of Computer Applications from Bengaluru City University in 2024 with a CGPA of 8.87. Currently pursuing MCA (2nd semester) at Amity University.</p>
              </article>
              <article className="card">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80" alt="Team discussion in office" className="about-card-image" loading="lazy" />
                <h3>Work Experience</h3>
                <p>Fresher with 3 months of internship experience at Unified Mentor as a Full Stack Developer. Built a real-time weather application using external APIs and developed a full-stack Clinic Management System with MERN, including an operation scheduler for hospital management workflows.</p>
              </article>
              <article className="card">
                <img src="https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=900&q=80" alt="Laptop with coding setup" className="about-card-image" loading="lazy" />
                <h3>Hobbies</h3>
                <p>Solving coding challenges, experimenting with UI design, playing cricket, watching series, and exploring different technology stacks.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="projects" className="section section-alt">
          <div className="container">
            <h2>Projects</h2>
            <p>Click any project card to view details in a modal.</p>
            <div className="projects-grid">
              {projects.map((project) => (
                <button
                  key={project._id}
                  type="button"
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                  aria-label={`Open project details for ${project.title}`}
                >
                  <img src={project.imageUrl} alt={project.title} loading="lazy" />
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="chips">
                      {(project.techStack || []).map((tech) => (
                        <span key={`${project._id}-${tech}`}>{tech}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container">
            <h2>Contact</h2>
            <p>Send a message using the form below, or connect with me directly.</p>
            <div className="contact-links">
              <a className="chip email" href="mailto:sandeshsmshetty9141@gmail.com">
                <span className="tag">Email</span>
                <span>sandeshsmshetty9141@gmail.com</span>
              </a>
              <a className="chip mobile" href="tel:+917338251903">
                <span className="tag">Mobile</span>
                <span>+91 7338251903</span>
              </a>
              <a className="chip whatsapp" href="https://wa.me/917338251903" target="_blank" rel="noreferrer">
                <span className="tag">WhatsApp</span>
                <span>Chat Now</span>
              </a>
              <a className="chip linkedin" href="https://www.linkedin.com/in/sandesh-shetty-245503246" target="_blank" rel="noreferrer">
                <span className="tag">LinkedIn</span>
                <span>Profile</span>
              </a>
              <a className="chip github" href="https://github.com/SandeshLu0923" target="_blank" rel="noreferrer">
                <span className="tag">GitHub</span>
                <span>@SandeshLu0923</span>
              </a>
            </div>
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <label>
                Name
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your name" />
                {formErrors.name && <small>{formErrors.name}</small>}
              </label>
              <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" />
                {formErrors.email && <small>{formErrors.email}</small>}
              </label>
              <label>
                Subject
                <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Reason for contact" />
                {formErrors.subject && <small>{formErrors.subject}</small>}
              </label>
              <label>
                Message
                <textarea name="message" rows="5" value={formData.message} onChange={handleInputChange} placeholder="Write your message" />
                {formErrors.message && <small>{formErrors.message}</small>}
              </label>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              {submitStatus.message && <p className={`form-status ${submitStatus.type}`}>{submitStatus.message}</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {year} Sandesh P. Built with MERN.</p>
        </div>
      </footer>

      <ProjectModal
        selectedProject={selectedProject}
        showImageViewer={showImageViewer}
        isClinicProject={isClinicProject}
        isOperationProject={isOperationProject}
        isWeatherProject={isWeatherProject}
        closeModal={closeModal}
        toggleImageViewer={toggleImageViewer}
        activeClinicRole={activeClinicRole}
        setActiveClinicRole={setActiveClinicRole}
        activeClinicImageIndex={activeClinicImageIndex}
        setActiveClinicImageIndex={setActiveClinicImageIndex}
        clinicImagesForRole={clinicImagesForRole}
        activeClinicImage={activeClinicImage}
        moveClinicImage={moveClinicImage}
        activeOperationRole={activeOperationRole}
        setActiveOperationRole={setActiveOperationRole}
        activeOperationImageIndex={activeOperationImageIndex}
        setActiveOperationImageIndex={setActiveOperationImageIndex}
        operationImagesForRole={operationImagesForRole}
        activeOperationImage={activeOperationImage}
        moveOperationImage={moveOperationImage}
        weatherImages={weatherImages}
        activeWeatherImageIndex={activeWeatherImageIndex}
        setActiveWeatherImageIndex={setActiveWeatherImageIndex}
        activeWeatherImage={activeWeatherImage}
        moveWeatherImage={moveWeatherImage}
      />
    </div>
  );
}

export default App;


