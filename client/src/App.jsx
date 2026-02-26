import { useEffect, useMemo, useState } from "react"
import "./App.css"

const fallbackProjects = [
  {
    _id: "1",
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
    projectUrl: "",
    githubUrl: "https://github.com/SandeshLu0923/Clinic-management",
  },
  {
    _id: "3",
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
    projectUrl: "",
    githubUrl: "https://github.com/SandeshLu0923/Operation-Scheduler",
  },
]

const sections = ["home", "about", "projects", "contact"]
const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

const clinicRoleButtons = [
  { key: "doctor", label: "Doctor Screenshots" },
  { key: "receptionist", label: "Receptionist Screenshots" },
  { key: "patient", label: "Patient Screenshots" },
]

const operationRoleButtons = [
  { key: "admin", label: "Admin Screenshots" },
  { key: "anesthesiologist", label: "Anesthesiologist Screenshots" },
  { key: "surgeon", label: "Surgeon Screenshots" },
  { key: "nurse", label: "Nurse Screenshots" },
]

const defaultForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

function App() {
  const [activeSection, setActiveSection] = useState("home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [projects, setProjects] = useState(fallbackProjects)
  const [selectedProject, setSelectedProject] = useState(null)
  const [formData, setFormData] = useState(defaultForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitStatus, setSubmitStatus] = useState({
    type: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [activeClinicRole, setActiveClinicRole] = useState("doctor")
  const [activeClinicImageIndex, setActiveClinicImageIndex] = useState(0)
  const [clinicScreensByRole, setClinicScreensByRole] = useState({
    doctor: [],
    receptionist: [],
    patient: [],
  })
  const [activeOperationRole, setActiveOperationRole] = useState("admin")
  const [activeOperationImageIndex, setActiveOperationImageIndex] = useState(0)
  const [operationScreensByRole, setOperationScreensByRole] = useState({
    admin: [],
    anesthesiologist: [],
    surgeon: [],
    nurse: [],
  })
  const [weatherImages, setWeatherImages] = useState([])
  const [activeWeatherImageIndex, setActiveWeatherImageIndex] = useState(0)

  const year = useMemo(() => new Date().getFullYear(), [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 },
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${apiBase}/api/projects`)
        if (!response.ok) {
          throw new Error("Could not fetch projects")
        }
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data)
        }
      } catch {
        setProjects(fallbackProjects)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedProject(null)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [selectedProject])

  useEffect(() => {
    if (!selectedProject) return
    if (selectedProject.title === "Clinic Management System") {
      const defaultRole = "patient"
      setShowImageViewer(false)
      setActiveClinicRole(defaultRole)
      setActiveClinicImageIndex(0)
      setClinicScreensByRole({
        doctor: [],
        receptionist: [],
        patient: [],
      })
    } else if (selectedProject.title === "Real-Time Weather App") {
      setShowImageViewer(false)
      setWeatherImages([])
      setActiveWeatherImageIndex(0)
    } else if (selectedProject.title === "Operation Scheduler For Hospital Management") {
      const defaultRole = "admin"
      setShowImageViewer(false)
      setActiveOperationRole(defaultRole)
      setActiveOperationImageIndex(0)
      setOperationScreensByRole({
        admin: [],
        anesthesiologist: [],
        surgeon: [],
        nurse: [],
      })
    }
  }, [selectedProject])

  useEffect(() => {
    const isClinicSelected = selectedProject?.title === "Clinic Management System"
    if (!isClinicSelected || !showImageViewer) return

    const loadRoleImages = async (role) => {
      try {
        const response = await fetch(`${apiBase}/api/screenshots/clinic/${role}`)
        if (!response.ok) return
        const data = await response.json()
        if (!data?.images || !Array.isArray(data.images)) return
        setClinicScreensByRole((prev) => ({ ...prev, [role]: data.images }))
      } catch {
        setClinicScreensByRole((prev) => ({ ...prev, [role]: [] }))
      }
    }

    clinicRoleButtons.forEach((role) => {
      if (clinicScreensByRole[role.key].length === 0) {
        loadRoleImages(role.key)
      }
    })
  }, [showImageViewer, selectedProject])

  useEffect(() => {
    const isOperationSelected =
      selectedProject?.title === "Operation Scheduler For Hospital Management"
    if (!isOperationSelected || !showImageViewer) return

    const loadRoleImages = async (role) => {
      try {
        const response = await fetch(`${apiBase}/api/screenshots/operation/${role}`)
        if (!response.ok) return
        const data = await response.json()
        if (!data?.images || !Array.isArray(data.images)) return
        setOperationScreensByRole((prev) => ({ ...prev, [role]: data.images }))
      } catch {
        setOperationScreensByRole((prev) => ({ ...prev, [role]: [] }))
      }
    }

    operationRoleButtons.forEach((role) => {
      if (operationScreensByRole[role.key].length === 0) {
        loadRoleImages(role.key)
      }
    })
  }, [showImageViewer, selectedProject])

  useEffect(() => {
    const isWeatherSelected = selectedProject?.title === "Real-Time Weather App"
    if (!isWeatherSelected || !showImageViewer) return

    const loadWeatherImages = async () => {
      try {
        const response = await fetch(`${apiBase}/api/screenshots/weather`)
        if (!response.ok) return
        const data = await response.json()
        if (!data?.images || !Array.isArray(data.images)) return
        setWeatherImages(data.images)
        setActiveWeatherImageIndex(0)
      } catch {
        setWeatherImages([])
      }
    }

    loadWeatherImages()
  }, [showImageViewer, selectedProject])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: "" }))
    setSubmitStatus({ type: "", message: "" })
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = "Name is required."
    if (!formData.email.trim()) {
      errors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address."
    }
    if (!formData.subject.trim()) errors.subject = "Subject is required."
    if (!formData.message.trim()) errors.message = "Message is required."
    return errors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Unable to send message right now.")
      }

      setSubmitStatus({
        type: "success",
        message: result.message || "Message sent successfully.",
      })
      setFormData(defaultForm)
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Something went wrong.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderNavLink = (id, label) => (
    <a
      href={`#${id}`}
      className={activeSection === id ? "active" : ""}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </a>
  )

  const isClinicProject = selectedProject?.title === "Clinic Management System"
  const isOperationProject =
    selectedProject?.title === "Operation Scheduler For Hospital Management"
  const isWeatherProject = selectedProject?.title === "Real-Time Weather App"
  const clinicImagesForRole = isClinicProject ? clinicScreensByRole[activeClinicRole] || [] : []
  const activeClinicImage = clinicImagesForRole[activeClinicImageIndex] || null
  const clinicImagePath = activeClinicImage?.url || ""
  const operationImagesForRole = isOperationProject
    ? operationScreensByRole[activeOperationRole] || []
    : []
  const activeOperationImage = operationImagesForRole[activeOperationImageIndex] || null
  const activeWeatherImage = weatherImages[activeWeatherImageIndex] || null

  const moveClinicImage = (direction) => {
    if (clinicImagesForRole.length === 0) return
    setActiveClinicImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % clinicImagesForRole.length
      return (prev - 1 + clinicImagesForRole.length) % clinicImagesForRole.length
    })
  }

  const moveWeatherImage = (direction) => {
    if (weatherImages.length === 0) return
    setActiveWeatherImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % weatherImages.length
      return (prev - 1 + weatherImages.length) % weatherImages.length
    })
  }

  const moveOperationImage = (direction) => {
    if (operationImagesForRole.length === 0) return
    setActiveOperationImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % operationImagesForRole.length
      return (prev - 1 + operationImagesForRole.length) % operationImagesForRole.length
    })
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="container nav-wrapper">
          <a href="#home" className="brand">
            <span>Portfolio</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav className={`site-nav ${menuOpen ? "open" : ""}`}>
            {renderNavLink("home", "Home")}
            {renderNavLink("about", "About")}
            {renderNavLink("projects", "Projects")}
            {renderNavLink("contact", "Contact")}
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
                MCA student passionate about building scalable web applications. Full Stack
                Developer specializing in the MERN stack. Constantly exploring new ways to optimize
                code with JavaScript and Python.
              </p>
              <div className="hero-actions">
                <a href="#projects" className="btn btn-primary">
                  View Projects
                </a>
                <a
                  href="/Resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  Open Resume
                </a>
                <a href="/Resume.pdf" download className="btn btn-secondary">
                  Download Resume
                </a>
              </div>
            </div>
            <div className="profile-card">
              <img src="/profile.jpeg" alt="Sandesh P profile photo" />
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container">
            <h2>About Me</h2>
            <p className="about-intro">
              I am an MCA student and Full Stack Developer who enjoys building scalable,
              production-ready MERN applications. My current focus includes a full-stack Clinic
              Management System and a weather application that integrates real-time data. I
              continuously refine my approach using JavaScript and Python to turn business ideas
              into reliable, user-friendly products.
            </p>
            <div className="about-grid">
              <article className="card">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
                  alt="Students studying in classroom"
                  className="about-card-image"
                />
                <h3>Education</h3>
                <p>
                  Graduated with a Bachelor of Computer Applications from Bengaluru City University
                  in 2024 with a CGPA of 8.87. Currently pursuing MCA (2nd semester) at Amity
                  University.
                </p>
              </article>
              <article className="card">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                  alt="Team discussion in office"
                  className="about-card-image"
                />
                <h3>Work Experience</h3>
                <p>
                  Fresher with 3 months of internship experience at Unified Mentor as a Full Stack
                  Developer. Built a real-time weather application using external APIs and developed
                  a full-stack Clinic Management System with MERN, including an operation scheduler
                  for hospital management workflows.
                </p>
              </article>
              <article className="card">
                <img
                  src="https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=900&q=80"
                  alt="Laptop with coding setup"
                  className="about-card-image"
                />
                <h3>Hobbies</h3>
                <p>
                  Solving coding challenges, experimenting with UI design, playing cricket, watching
                  series, and exploring different technology stacks.
                </p>
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
                <article
                  key={project._id}
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                >
                  <img src={project.imageUrl} alt={project.title} />
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="chips">
                      {(project.techStack || []).map((tech) => (
                        <span key={`${project._id}-${tech}`}>{tech}</span>
                      ))}
                    </div>
                  </div>
                </article>
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
              <a
                className="chip whatsapp"
                href="https://wa.me/917338251903"
                target="_blank"
                rel="noreferrer"
              >
                <span className="tag">WhatsApp</span>
                <span>Chat Now</span>
              </a>
              <a
                className="chip linkedin"
                href="https://www.linkedin.com/in/sandesh-shetty-245503246"
                target="_blank"
                rel="noreferrer"
              >
                <span className="tag">LinkedIn</span>
                <span>Profile</span>
              </a>
              <a
                className="chip github"
                href="https://github.com/SandeshLu0923"
                target="_blank"
                rel="noreferrer"
              >
                <span className="tag">GitHub</span>
                <span>@SandeshLu0923</span>
              </a>
            </div>
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
                {formErrors.name && <small>{formErrors.name}</small>}
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                />
                {formErrors.email && <small>{formErrors.email}</small>}
              </label>
              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Reason for contact"
                />
                {formErrors.subject && <small>{formErrors.subject}</small>}
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message"
                />
                {formErrors.message && <small>{formErrors.message}</small>}
              </label>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              {submitStatus.message && (
                <p className={`form-status ${submitStatus.type}`}>{submitStatus.message}</p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>(c) {year} Sandesh P. Built with MERN.</p>
        </div>
      </footer>

      {selectedProject && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelectedProject(null)
            setShowImageViewer(false)
          }}
        >
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => {
                setSelectedProject(null)
                setShowImageViewer(false)
              }}
              aria-label="Close modal"
            >
              x
            </button>
            <img src={selectedProject.imageUrl} alt={selectedProject.title} />
            <h3>{selectedProject.title}</h3>
            <p>{selectedProject.description}</p>
            <div className="chips">
              {(selectedProject.techStack || []).map((tech) => (
                <span key={`selected-${tech}`}>{tech}</span>
              ))}
            </div>
            <div className="modal-actions">
              {selectedProject.projectUrl && (
                <a href={selectedProject.projectUrl} target="_blank" rel="noreferrer">
                  Live Demo
                </a>
              )}
              {selectedProject.githubUrl && (
                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              )}
              {(isClinicProject || isOperationProject || isWeatherProject) && (
                <button
                  type="button"
                  className="view-images-btn"
                  onClick={() => {
                    setShowImageViewer((prev) => !prev)
                    if (!showImageViewer && isClinicProject) {
                      setActiveClinicRole("patient")
                      setActiveClinicImageIndex(0)
                    }
                    if (!showImageViewer && isOperationProject) {
                      setActiveOperationRole("admin")
                      setActiveOperationImageIndex(0)
                    }
                  }}
                >
                  {showImageViewer ? "Hide Images" : "View Images"}
                </button>
              )}
            </div>

            {isClinicProject && showImageViewer && (
              <div className="clinic-screenshots">
                <div className="role-buttons">
                  {clinicRoleButtons.map((role) => (
                    <button
                      key={role.key}
                      type="button"
                      className={`role-btn ${activeClinicRole === role.key ? "active" : ""}`}
                      onClick={() => {
                        setActiveClinicRole(role.key)
                        setActiveClinicImageIndex(0)
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {clinicImagesForRole.length > 0 ? (
                  <>
                    <div className="viewer-top">
                      <button
                        type="button"
                        className="nav-btn"
                        onClick={() => moveClinicImage("prev")}
                      >
                        Prev
                      </button>
                      <span className="viewer-index">
                        {activeClinicImageIndex + 1} / {clinicImagesForRole.length}
                      </span>
                      <button
                        type="button"
                        className="nav-btn"
                        onClick={() => moveClinicImage("next")}
                      >
                        Next
                      </button>
                    </div>
                    <img
                      src={clinicImagePath}
                      alt={`${activeClinicRole} screen ${activeClinicImage?.fileName || ""}`}
                      className="viewer-image"
                    />
                    <div className="file-list">
                      {clinicImagesForRole.map((image, index) => (
                        <button
                          key={image.fileName}
                          type="button"
                          className={`file-name-btn ${activeClinicImageIndex === index ? "active" : ""}`}
                          onClick={() => setActiveClinicImageIndex(index)}
                        >
                          <img src={image.url} alt={image.fileName} className="file-thumb" />
                          <span>{image.fileName}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="no-screenshots">
                    No screenshots found for this role yet. Add image files to{" "}
                    <code>{`client/public/projects/clinic/${activeClinicRole}`}</code>.
                  </p>
                )}
              </div>
            )}

            {isWeatherProject && showImageViewer && (
              <div className="clinic-screenshots">
                {weatherImages.length > 0 ? (
                  <>
                    <div className="viewer-top">
                      <button
                        type="button"
                        className="nav-btn"
                        onClick={() => moveWeatherImage("prev")}
                      >
                        Prev
                      </button>
                      <span className="viewer-index">
                        {activeWeatherImageIndex + 1} / {weatherImages.length}
                      </span>
                      <button
                        type="button"
                        className="nav-btn"
                        onClick={() => moveWeatherImage("next")}
                      >
                        Next
                      </button>
                    </div>
                    <img
                      src={activeWeatherImage?.url}
                      alt={activeWeatherImage?.fileName || "Weather screenshot"}
                      className="viewer-image"
                    />
                    <div className="file-list">
                      {weatherImages.map((image, index) => (
                        <button
                          key={image.fileName}
                          type="button"
                          className={`file-name-btn ${activeWeatherImageIndex === index ? "active" : ""}`}
                          onClick={() => setActiveWeatherImageIndex(index)}
                        >
                          <img src={image.url} alt={image.fileName} className="file-thumb" />
                          <span>{image.fileName}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="no-screenshots">
                    No weather screenshots found. Add files to{" "}
                    <code>client/public/projects/weather</code>.
                  </p>
                )}
              </div>
            )}

            {isOperationProject && showImageViewer && (
              <div className="clinic-screenshots">
                <div className="role-buttons">
                  {operationRoleButtons.map((role) => (
                    <button
                      key={role.key}
                      type="button"
                      className={`role-btn ${activeOperationRole === role.key ? "active" : ""}`}
                      onClick={() => {
                        setActiveOperationRole(role.key)
                        setActiveOperationImageIndex(0)
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {operationImagesForRole.length > 0 ? (
                  <>
                    <div className="viewer-top">
                      <button
                        type="button"
                        className="nav-btn"
                        onClick={() => moveOperationImage("prev")}
                      >
                        Prev
                      </button>
                      <span className="viewer-index">
                        {activeOperationImageIndex + 1} / {operationImagesForRole.length}
                      </span>
                      <button
                        type="button"
                        className="nav-btn"
                        onClick={() => moveOperationImage("next")}
                      >
                        Next
                      </button>
                    </div>
                    <img
                      src={activeOperationImage?.url}
                      alt={`${activeOperationRole} screen ${activeOperationImage?.fileName || ""}`}
                      className="viewer-image"
                    />
                    <div className="file-list">
                      {operationImagesForRole.map((image, index) => (
                        <button
                          key={image.fileName}
                          type="button"
                          className={`file-name-btn ${activeOperationImageIndex === index ? "active" : ""}`}
                          onClick={() => setActiveOperationImageIndex(index)}
                        >
                          <img src={image.url} alt={image.fileName} className="file-thumb" />
                          <span>{image.fileName}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="no-screenshots">
                    No screenshots found for this role yet. Add image files to{" "}
                    <code>{`client/public/projects/Operation-Scheduler/${activeOperationRole}`}</code>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
