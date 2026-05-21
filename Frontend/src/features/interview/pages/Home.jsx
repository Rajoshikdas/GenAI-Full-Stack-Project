import React, { useState, useRef } from "react";

import "../style/home.scss";

import { useInterview } from "../hooks/useInterview";

import { useNavigate } from "react-router-dom";

const Home = () => {
  const { loading, generateReport, reports } = useInterview();

  const [jobDescription, setJobDescription] = useState("");

  const [selfDescription, setSelfDescription] = useState("");

  const [selectedFileName, setSelectedFileName] = useState("");

  const resumeInputRef = useRef(null);

  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    try {
      const resumeFile =
        resumeInputRef.current?.files?.[0];

      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      // SAFE NAVIGATION
      if (data?._id) {
        navigate(`/interview/${data._id}`);
      } else {
        alert("Failed to generate report");
      }
    } catch (error) {
      console.error(
        "Generate Report Failed:",
        error
      );
    }
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <h1>
          Loading your interview plan...
        </h1>
      </main>
    );
  }

  return (
    <div className="home-page">

      {/* HEADER */}

      <header className="page-header">
        <h1>
          Create Your Custom{" "}
          <span className="highlight">
            Interview Plan
          </span>
        </h1>

        <p>
          Let our AI analyze the job
          requirements and your unique
          profile to build a winning
          strategy.
        </p>
      </header>

      {/* MAIN CARD */}

      <div className="interview-card">

        <div className="interview-card__body">

          {/* LEFT PANEL */}

          <div className="panel panel--left">

            <div className="panel__header">
              <h2>
                Target Job Description
              </h2>
            </div>

            <textarea
              onChange={(e) =>
                setJobDescription(
                  e.target.value
                )
              }
              className="panel__textarea"
              placeholder="Paste the full job description here..."
              maxLength={5000}
            />

          </div>

          {/* RIGHT PANEL */}

          <div className="panel panel--right">

            <div className="panel__header">
              <h2>Your Profile</h2>
            </div>

            {/* RESUME */}

            <div className="upload-section">

              <label
                className="section-label"
              >
                Upload Resume
              </label>

              <label
                className="dropzone"
                htmlFor="resume"
              >
                <p>
                  {selectedFileName ? `Selected: ${selectedFileName}` : "Click to upload resume"}
                </p>

                <input
                  ref={resumeInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                    } else {
                      setSelectedFileName("");
                    }
                  }}
                  hidden
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.docx"
                />
              </label>

            </div>

            {/* SELF DESCRIPTION */}

            <div className="self-description">

              <label
                className="section-label"
                htmlFor="selfDescription"
              >
                Quick Self Description
              </label>

              <textarea
                onChange={(e) =>
                  setSelfDescription(
                    e.target.value
                  )
                }
                id="selfDescription"
                className="panel__textarea panel__textarea--short"
                placeholder="Describe yourself..."
              />

            </div>

          </div>
        </div>

        {/* FOOTER */}

        <div className="interview-card__footer">

          <button
            onClick={handleGenerateReport}
            className="generate-btn"
          >
            Generate My Interview Strategy
          </button>

        </div>

      </div>

      {/* REPORTS */}

      {reports?.length > 0 && (
        <section className="recent-reports">

          <h2>
            My Recent Interview Plans
          </h2>

          <ul className="reports-list">

            {reports.map((report) => (
              <li
                key={report._id}
                className="report-item"
                onClick={() =>
                  navigate(
                    `/interview/${report._id}`
                  )
                }
              >

                <h3>
                  {report.title ||
                    "Untitled Position"}
                </h3>

                <p className="report-meta">
                  Generated on{" "}
                  {new Date(
                    report.createdAt
                  ).toLocaleDateString()}
                </p>

                <p className="match-score">
                  Match Score:{" "}
                  {report.matchScore}%
                </p>

              </li>
            ))}

          </ul>

        </section>
      )}

    </div>
  );
};

export default Home;