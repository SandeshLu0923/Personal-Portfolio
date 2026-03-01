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
const authTokenStorageKey = "portfolio_auth_token";

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

  const [authToken, setAuthToken] = useState(() => localStorage.getItem(authTokenStorageKey) || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authStatus, setAuthStatus] = useState({ type: "", message: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    code: "",
  });

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
  const isAuthenticated = Boolean(authToken && currentUser);

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
    if (!authToken) {
      setCurrentUser(null);
      return;
    }

    const loadProfile = async () => {
      try {
        const result = await fetchJson(`${apiBase}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setCurrentUser(result.user || null);
      } catch {
        setCurrentUser(null);
        setAuthToken("");
        localStorage.removeItem(authTokenStorageKey);
      }
    };

    loadProfile();
  }, [authToken]);

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

  const requireSignIn = (message) => {
    if (isAuthenticated) return true;
    setAuthStatus({ type: "error", message });
    const authSection = document.getElementById("auth-gate");
    if (authSection) {
      authSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return false;
  };

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

  const handleResumeAction = (type) => {
    if (!requireSignIn("Please sign in first to open or download resume.")) return;

    if (type === "open") {
      window.open("/Resume.pdf", "_blank", "noopener,noreferrer");
      return;
    }

    const link = document.createElement("a");
    link.href = "/Resume.pdf";
    link.download = "Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    try {
      const result = await fetchJson(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      }, 30000);

      setAuthMode("verify");
      setAuthStatus({ type: "success", message: result.message || "Verification code sent." });
    } catch (error) {
      setAuthStatus({ type: "error", message: error.message || "Registration failed." });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyEmail = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    try {
      const result = await fetchJson(`${apiBase}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email, code: authForm.code }),
      }, 30000);

      setAuthMode("login");
      setAuthStatus({ type: "success", message: result.message || "Email verified. Please login." });
    } catch (error) {
      setAuthStatus({ type: "error", message: error.message || "Verification failed." });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendCode = async () => {
    setAuthLoading(true);
    try {
      const result = await fetchJson(`${apiBase}/api/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email }),
      }, 30000);

      setAuthStatus({ type: "success", message: result.message || "Verification code resent." });
    } catch (error) {
      setAuthStatus({ type: "error", message: error.message || "Failed to resend code." });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    try {
      const result = await fetchJson(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      }, 30000);

      localStorage.setItem(authTokenStorageKey, result.token);
      setAuthToken(result.token);
      setCurrentUser(result.user || null);
      setAuthStatus({ type: "success", message: result.message || "Logged in successfully." });
    } catch (error) {
      setAuthStatus({ type: "error", message: error.message || "Login failed." });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(authTokenStorageKey);
    setAuthToken("");
    setCurrentUser(null);
    setSelectedProject(null);
    setShowImageViewer(false);
    setAuthStatus({ type: "success", message: "You have been logged out." });
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
        65000,
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
                <button type="button" className="btn btn-secondary" onClick={() => handleResumeAction("open")}>Open Resume</button>
                <button type="button" className="btn btn-secondary" onClick={() => handleResumeAction("download")}>Download Resume</button>
              </div>
            </div>
            <div className="profile-card">
              <img src="/profile.jpeg" alt="Sandesh P profile photo" loading="lazy" />
            </div>
          </div>
        </section>

        <section id="auth-gate" className="section section-auth">
          <div className="container">
            <h2>Account Access</h2>
            <p>Sign in to unlock project details, screenshots, and resume actions.</p>

            {isAuthenticated ? (
              <div className="auth-card">
                <p className="auth-welcome">Signed in as <strong>{currentUser?.name}</strong> ({currentUser?.email})</p>
                <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div className="auth-card">
                <div className="auth-tabs">
                  <button type="button" className={`role-btn ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>Login</button>
                  <button type="button" className={`role-btn ${authMode === "register" ? "active" : ""}`} onClick={() => setAuthMode("register")}>Register</button>
                  <button type="button" className={`role-btn ${authMode === "verify" ? "active" : ""}`} onClick={() => setAuthMode("verify")}>Verify Email</button>
                </div>

                {authMode === "register" && (
                  <form className="contact-form" onSubmit={handleRegister}>
                    <label>
                      Full Name
                      <input type="text" name="name" value={authForm.name} onChange={handleAuthInputChange} required />
                    </label>
                    <label>
                      Email
                      <input type="email" name="email" value={authForm.email} onChange={handleAuthInputChange} required />
                    </label>
                    <label>
                      Password
                      <input type="password" name="password" value={authForm.password} onChange={handleAuthInputChange} required minLength={6} />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={authLoading}>{authLoading ? "Creating..." : "Create Account"}</button>
                  </form>
                )}

                {authMode === "verify" && (
                  <form className="contact-form" onSubmit={handleVerifyEmail}>
                    <label>
                      Email
                      <input type="email" name="email" value={authForm.email} onChange={handleAuthInputChange} required />
                    </label>
                    <label>
                      Verification Code
                      <input type="text" name="code" value={authForm.code} onChange={handleAuthInputChange} required />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={authLoading}>{authLoading ? "Verifying..." : "Verify Email"}</button>
                    <button className="btn btn-secondary" type="button" onClick={handleResendCode} disabled={authLoading}>Resend Code</button>
                  </form>
                )}

                {authMode === "login" && (
                  <form className="contact-form" onSubmit={handleLogin}>
                    <label>
                      Email
                      <input type="email" name="email" value={authForm.email} onChange={handleAuthInputChange} required />
                    </label>
                    <label>
                      Password
                      <input type="password" name="password" value={authForm.password} onChange={handleAuthInputChange} required minLength={6} />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={authLoading}>{authLoading ? "Signing in..." : "Sign In"}</button>
                  </form>
                )}
              </div>
            )}

            {authStatus.message && <p className={`form-status ${authStatus.type}`}>{authStatus.message}</p>}
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
            {!isAuthenticated && (
              <p className="project-lock-message">Please sign in to open project details and screenshots.</p>
            )}
            <div className="projects-grid">
              {projects.map((project) => (
                <button
                  key={project._id}
                  type="button"
                  className={`project-card ${!isAuthenticated ? "locked" : ""}`}
                  onClick={() => {
                    if (!requireSignIn("Please sign in first to view project details.")) return;
                    setSelectedProject(project);
                  }}
                  aria-label={`Open project details for ${project.title}`}
                  disabled={!isAuthenticated}
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

      {isAuthenticated && (
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
      )}
    </div>
  );
}

export default App;
