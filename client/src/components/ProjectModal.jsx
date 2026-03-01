import { clinicRoleButtons, operationRoleButtons } from "../constants/projectConfig";

function ProjectModal({
  selectedProject,
  showImageViewer,
  isClinicProject,
  isOperationProject,
  isWeatherProject,
  closeModal,
  toggleImageViewer,
  activeClinicRole,
  setActiveClinicRole,
  activeClinicImageIndex,
  setActiveClinicImageIndex,
  clinicImagesForRole,
  activeClinicImage,
  moveClinicImage,
  activeOperationRole,
  setActiveOperationRole,
  activeOperationImageIndex,
  setActiveOperationImageIndex,
  operationImagesForRole,
  activeOperationImage,
  moveOperationImage,
  weatherImages,
  activeWeatherImageIndex,
  setActiveWeatherImageIndex,
  activeWeatherImage,
  moveWeatherImage,
}) {
  if (!selectedProject) return null;

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${selectedProject.title} details`}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={closeModal} aria-label="Close modal" type="button">
          x
        </button>
        <img src={selectedProject.imageUrl} alt={selectedProject.title} loading="lazy" />
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
            <button type="button" className="view-images-btn" onClick={toggleImageViewer}>
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
                    setActiveClinicRole(role.key);
                    setActiveClinicImageIndex(0);
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {clinicImagesForRole.length > 0 ? (
              <>
                <div className="viewer-top">
                  <button type="button" className="nav-btn" onClick={() => moveClinicImage("prev")}>
                    Prev
                  </button>
                  <span className="viewer-index">
                    {activeClinicImageIndex + 1} / {clinicImagesForRole.length}
                  </span>
                  <button type="button" className="nav-btn" onClick={() => moveClinicImage("next")}>
                    Next
                  </button>
                </div>
                <img
                  src={activeClinicImage?.url}
                  alt={`${activeClinicRole} screen ${activeClinicImage?.fileName || ""}`}
                  className="viewer-image"
                  loading="lazy"
                />
                <div className="file-list">
                  {clinicImagesForRole.map((image, index) => (
                    <button
                      key={image.fileName}
                      type="button"
                      className={`file-name-btn ${activeClinicImageIndex === index ? "active" : ""}`}
                      onClick={() => setActiveClinicImageIndex(index)}
                    >
                      <img src={image.url} alt={image.fileName} className="file-thumb" loading="lazy" />
                      <span>{image.fileName}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-screenshots">
                No screenshots found for this role yet. Add image files to <code>{`client/public/projects/clinic/${activeClinicRole}`}</code>.
              </p>
            )}
          </div>
        )}

        {isWeatherProject && showImageViewer && (
          <div className="clinic-screenshots">
            {weatherImages.length > 0 ? (
              <>
                <div className="viewer-top">
                  <button type="button" className="nav-btn" onClick={() => moveWeatherImage("prev")}>
                    Prev
                  </button>
                  <span className="viewer-index">
                    {activeWeatherImageIndex + 1} / {weatherImages.length}
                  </span>
                  <button type="button" className="nav-btn" onClick={() => moveWeatherImage("next")}>
                    Next
                  </button>
                </div>
                <img
                  src={activeWeatherImage?.url}
                  alt={activeWeatherImage?.fileName || "Weather screenshot"}
                  className="viewer-image"
                  loading="lazy"
                />
                <div className="file-list">
                  {weatherImages.map((image, index) => (
                    <button
                      key={image.fileName}
                      type="button"
                      className={`file-name-btn ${activeWeatherImageIndex === index ? "active" : ""}`}
                      onClick={() => setActiveWeatherImageIndex(index)}
                    >
                      <img src={image.url} alt={image.fileName} className="file-thumb" loading="lazy" />
                      <span>{image.fileName}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-screenshots">
                No weather screenshots found. Add files to <code>client/public/projects/weather</code>.
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
                    setActiveOperationRole(role.key);
                    setActiveOperationImageIndex(0);
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {operationImagesForRole.length > 0 ? (
              <>
                <div className="viewer-top">
                  <button type="button" className="nav-btn" onClick={() => moveOperationImage("prev")}>
                    Prev
                  </button>
                  <span className="viewer-index">
                    {activeOperationImageIndex + 1} / {operationImagesForRole.length}
                  </span>
                  <button type="button" className="nav-btn" onClick={() => moveOperationImage("next")}>
                    Next
                  </button>
                </div>
                <img
                  src={activeOperationImage?.url}
                  alt={`${activeOperationRole} screen ${activeOperationImage?.fileName || ""}`}
                  className="viewer-image"
                  loading="lazy"
                />
                <div className="file-list">
                  {operationImagesForRole.map((image, index) => (
                    <button
                      key={image.fileName}
                      type="button"
                      className={`file-name-btn ${activeOperationImageIndex === index ? "active" : ""}`}
                      onClick={() => setActiveOperationImageIndex(index)}
                    >
                      <img src={image.url} alt={image.fileName} className="file-thumb" loading="lazy" />
                      <span>{image.fileName}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-screenshots">
                No screenshots found for this role yet. Add image files to <code>{`client/public/projects/Operation-Scheduler/${activeOperationRole}`}</code>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectModal;
