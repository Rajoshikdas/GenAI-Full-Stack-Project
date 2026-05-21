const PDFDocument = require("pdfkit");

const PAGE_MARGIN = 46;
const SECTION_GAP = 10;
const LINE_GAP = 3;

function clean(value) {
    return String(value || "").trim();
}

function cleanList(values) {
    return (values || [])
        .map(clean)
        .filter(Boolean);
}

function ensureSpace(doc, height = 60) {
    if (doc.y + height > doc.page.height - PAGE_MARGIN) {
        doc.addPage();
    }
}

function sectionTitle(doc, title) {
    ensureSpace(doc, 36);

    doc
        .moveDown(0.45)
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#111111")
        .text(title.toUpperCase(), {
            characterSpacing: 0.5
        });

    doc
        .moveTo(PAGE_MARGIN, doc.y + 2)
        .lineTo(doc.page.width - PAGE_MARGIN, doc.y + 2)
        .strokeColor("#222222")
        .lineWidth(0.7)
        .stroke();

    doc.moveDown(0.6);
}

function paragraph(doc, text) {
    const content = clean(text);
    if (!content) return;

    ensureSpace(doc, 48);

    doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#111111")
        .text(content, {
            lineGap: LINE_GAP,
            align: "left"
        });
}

function bullet(doc, text) {
    const content = clean(text);
    if (!content) return;

    ensureSpace(doc, 32);

    const left = PAGE_MARGIN + 12;
    const width = doc.page.width - PAGE_MARGIN * 2 - 12;

    doc
        .font("Helvetica")
        .fontSize(9.3)
        .fillColor("#111111")
        .text("- ", PAGE_MARGIN, doc.y, {
            continued: true
        })
        .text(content, {
            width,
            indent: 0,
            lineGap: LINE_GAP
        });

    doc.x = left;
}

function inlineList(doc, values) {
    const items = cleanList(values);
    if (!items.length) return;

    paragraph(doc, items.join(" | "));
}

function renderHeader(doc, resume) {
    const name = clean(resume.name) || "Candidate Name";
    const headline = clean(resume.headline);
    const contact = resume.contact || {};
    const contactLine = cleanList([
        contact.email,
        contact.phone,
        contact.location,
        contact.linkedin,
        contact.portfolio
    ]).join(" | ");

    doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#111111")
        .text(name, {
            align: "center"
        });

    if (headline) {
        doc
            .moveDown(0.2)
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#222222")
            .text(headline, {
                align: "center"
            });
    }

    if (contactLine) {
        doc
            .moveDown(0.25)
            .font("Helvetica")
            .fontSize(8.8)
            .fillColor("#333333")
            .text(contactLine, {
                align: "center"
            });
    }

    doc.moveDown(0.8);
}

function renderExperience(doc, experience) {
    const items = experience || [];
    if (!items.length) return;

    sectionTitle(doc, "Professional Experience");

    items.forEach((item, index) => {
        const roleCompany = cleanList([item.role, item.company]).join(" - ");
        const meta = cleanList([item.location, item.dates]).join(" | ");

        ensureSpace(doc, 72);

        if (index > 0) {
            doc.moveDown(0.45);
        }

        if (roleCompany) {
            doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("#111111")
                .text(roleCompany);
        }

        if (meta) {
            doc
                .font("Helvetica")
                .fontSize(8.8)
                .fillColor("#444444")
                .text(meta);
        }

        cleanList(item.bullets).slice(0, 6).forEach((line) => bullet(doc, line));
    });
}

function renderProjects(doc, projects) {
    const items = projects || [];
    if (!items.length) return;

    sectionTitle(doc, "Projects");

    items.slice(0, 4).forEach((project, index) => {
        const title = clean(project.name);
        const description = clean(project.description);
        const technologies = cleanList(project.technologies);

        ensureSpace(doc, 62);

        if (index > 0) {
            doc.moveDown(0.35);
        }

        if (title) {
            doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("#111111")
                .text(title);
        }

        if (description) {
            paragraph(doc, description);
        }

        if (technologies.length) {
            doc
                .font("Helvetica-Oblique")
                .fontSize(8.8)
                .fillColor("#333333")
                .text(`Technologies: ${technologies.join(", ")}`, {
                    lineGap: LINE_GAP
                });
        }

        cleanList(project.bullets).slice(0, 3).forEach((line) => bullet(doc, line));
    });
}

function renderEducation(doc, education) {
    const items = education || [];
    if (!items.length) return;

    sectionTitle(doc, "Education");

    items.forEach((item) => {
        const degree = clean(item.degree);
        const meta = cleanList([item.institution, item.location, item.dates]).join(" | ");

        ensureSpace(doc, 36);

        if (degree) {
            doc
                .font("Helvetica-Bold")
                .fontSize(9.5)
                .fillColor("#111111")
                .text(degree);
        }

        if (meta) {
            doc
                .font("Helvetica")
                .fontSize(8.8)
                .fillColor("#333333")
                .text(meta);
        }
    });
}

async function generateResumePdf(resume) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            margin: PAGE_MARGIN,
            size: "LETTER",
            bufferPages: true,
            info: {
                Title: "ATS Optimized Resume",
                Subject: "Job-tailored professional resume"
            }
        });

        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        renderHeader(doc, resume);

        sectionTitle(doc, "Professional Summary");
        paragraph(doc, resume.professionalSummary);

        sectionTitle(doc, "Core Skills");
        inlineList(doc, resume.coreSkills);

        renderExperience(doc, resume.experience);
        renderProjects(doc, resume.projects);

        const certifications = cleanList(resume.certifications);
        if (certifications.length) {
            sectionTitle(doc, "Certifications");
            certifications.forEach((item) => bullet(doc, item));
        }

        renderEducation(doc, resume.education);

        const keywords = cleanList(resume.atsKeywords);
        if (keywords.length) {
            sectionTitle(doc, "Additional ATS Keywords");
            inlineList(doc, keywords.slice(0, 30));
        }

        doc.end();
    });
}

module.exports = {
    generateResumePdf
};
