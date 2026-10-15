
const STORAGE_KEY = "campus_sis_students_v1";

let students = loadStudents();
let toastTimer;

// Get HTML elements
const studentModal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
const studentsTable = document.getElementById("studentsTable");
const recentStudents = document.getElementById("recentStudents");
const studentsEmpty = document.getElementById("studentsEmpty");
const recentEmpty = document.getElementById("recentEmpty");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

// Load saved records from this browser
function loadStudents() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const records = saved ? JSON.parse(saved) : [];
        return Array.isArray(records) ? records : [];
    } catch (error) {
        console.error("Unable to load student records:", error);
        return [];
    }
}

// Save records to this browser
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return true;
    } catch (error) {
        showToast("Unable to save data in this browser.");
        return false;
    }
}

// Safely display text entered by users
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Show a notification
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

// Format a student's initials
function getInitials(student) {
    return (
        (student.firstName[0] || "") +
        (student.lastName[0] || "")
    ).toUpperCase();
}

// Create a status badge
function statusBadge(status) {
    let className = "status-inactive";

    if (status === "Active") {
        className = "status-active";
    } else if (status === "Graduated") {
        className = "status-graduated";
    }

    return `
        <span class="status ${className}">
            ${escapeHTML(status)}
        </span>
    `;
}

// Update the dashboard statistics
function updateStatistics() {
    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("activeStudents").textContent =
        students.filter(student => student.status === "Active").length;

    document.getElementById("inactiveStudents").textContent =
        students.filter(student => student.status === "Inactive").length;
}

// Render the dashboard's recent students
function renderRecentStudents() {
    const recent = [...students].slice(-5).reverse();

    recentStudents.innerHTML = recent.map(student => `
        <tr>
            <td>
                <div class="student-person">
                    <div class="student-avatar">
                        ${escapeHTML(getInitials(student))}
                    </div>
                    <div>
                        <div class="student-name">
                            ${escapeHTML(student.firstName)}
                            ${escapeHTML(student.lastName)}
                        </div>
                        <div class="student-email">
                            ${escapeHTML(student.email || "No email")}
                        </div>
                    </div>
                </div>
            </td>
            <td>${escapeHTML(student.studentId)}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>${escapeHTML(student.yearLevel)}</td>
            <td>${statusBadge(student.status)}</td>
        </tr>
    `).join("");

    recentEmpty.style.display =
        recent.length === 0 ? "block" : "none";

    recentStudents.closest(".table-wrap").style.display =
        recent.length === 0 ? "none" : "block";
}

// Get students matching the current search and status filter
function getFilteredStudents() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    return students.filter(student => {
        const searchableText = [
            student.studentId,
            student.firstName,
            student.lastName,
            student.email,
            student.course,
            student.yearLevel
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);

        const matchesStatus =
            selectedStatus === "All" ||
            student.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
}

// Render the complete student records table
function renderStudents() {
    const filteredStudents = getFilteredStudents();

    studentsTable.innerHTML = filteredStudents.map(student => {
        const index = students.findIndex(
            item => item.studentId === student.studentId
        );

        return `
            <tr>
                <td>
                    <div class="student-person">
                        <div class="student-avatar">
                            ${escapeHTML(getInitials(student))}
                        </div>
                        <div>
                            <div class="student-name">
                                ${escapeHTML(student.firstName)}
                                ${escapeHTML(student.lastName)}
                            </div>
                        </div>
                    </div>
                </td>

                <td>${escapeHTML(student.studentId)}</td>
                <td>${escapeHTML(student.email || "—")}</td>
                <td>${escapeHTML(student.course)}</td>
                <td>${escapeHTML(student.yearLevel)}</td>
                <td>${statusBadge(student.status)}</td>

                <td>
                    <div class="action-buttons">
                        <button
                            class="action-btn edit"
                            data-action="edit"
                            data-index="${index}"
                        >Edit</button>

                        <button
                            class="action-btn delete"
                            data-action="delete"
                            data-index="${index}"
                        >Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    studentsEmpty.style.display =
        filteredStudents.length === 0 ? "block" : "none";

    document.getElementById("recordCount").textContent =
        `${filteredStudents.length} of ${students.length} student(s)`;

    updateStatistics();
    renderRecentStudents();
}

// Render all pages that depend on student records
function renderAll() {
    renderStudents();
}

// Open the student form
function openModal(index = null) {
    studentForm.reset();

    document.getElementById("editIndex").value = "";

    if (index !== null && students[index]) {
        const student = students[index];

        document.getElementById("modalTitle").textContent =
            "Edit Student";

        document.getElementById("editIndex").value = index;

        document.getElementById("studentId").value =
            student.studentId;

        document.getElementById("firstName").value =
            student.firstName;

        document.getElementById("lastName").value =
            student.lastName;

        document.getElementById("email").value =
            student.email;

        document.getElementById("course").value =
            student.course;

        document.getElementById("yearLevel").value =
            student.yearLevel;

        document.getElementById("gender").value =
            student.gender || "";

        document.getElementById("status").value =
            student.status;
    } else {
        document.getElementById("modalTitle").textContent =
            "Add Student";

        document.getElementById("status").value = "Active";
    }

    studentModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    document.getElementById("studentId").focus();
}

// Close the student form
function closeModal() {
    studentModal.classList.add("hidden");
    document.body.style.overflow = "";
    studentForm.reset();
}

// Save a new student or update an existing student
studentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const editValue = document.getElementById("editIndex").value;

    const editIndex =
        editValue === "" ? -1 : Number(editValue);

    const student = {
        studentId: document.getElementById("studentId").value.trim(),
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value,
        yearLevel: document.getElementById("yearLevel").value,
        gender: document.getElementById("gender").value,
        status: document.getElementById("status").value
    };

    if (
        !student.studentId ||
        !student.firstName ||
        !student.lastName ||
        !student.course ||
        !student.yearLevel
    ) {
        showToast("Please complete all required fields.");
        return;
    }

    // Student IDs must be unique
    const duplicate = students.some((item, index) => {
        return (
            item.studentId.toLowerCase() ===
                student.studentId.toLowerCase() &&
            index !== editIndex
        );
    });

    if (duplicate) {
        showToast("This student ID already exists.");
        document.getElementById("studentId").focus();
        return;
    }

    const previousStudents = [...students];

    if (editIndex >= 0 && students[editIndex]) {
        students[editIndex] = student;
    } else {
        students.push(student);
    }

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    closeModal();
    renderAll();

    showToast(
        editIndex >= 0
            ? "Student record updated successfully."
            : "Student added successfully."
    );
});

// Add student buttons
document.getElementById("addStudentTop").addEventListener(
    "click",
    () => openModal()
);

document.getElementById("addStudentButton").addEventListener(
    "click",
    () => openModal()
);

document.getElementById("addFirstStudent").addEventListener(
    "click",
    () => openModal()
);

// Close form buttons
document.getElementById("closeModal").addEventListener(
    "click",
    closeModal
);

document.getElementById("cancelButton").addEventListener(
    "click",
    closeModal
);

studentModal.addEventListener("click", function (event) {
    if (event.target === studentModal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" &&
        !studentModal.classList.contains("hidden")) {
        closeModal();
    }
});

// Handle Edit and Delete buttons
studentsTable.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const index = Number(button.dataset.index);

    if (!students[index]) return;

    if (button.dataset.action === "edit") {
        openModal(index);
    }

    if (button.dataset.action === "delete") {
        const student = students[index];

        const confirmed = confirm(
            `Delete ${student.firstName} ${student.lastName} ` +
            `(${student.studentId})?`
        );

        if (!confirmed) return;

        const previousStudents = [...students];

        students.splice(index, 1);

        if (!saveStudents()) {
            students = previousStudents;
            return;
        }

        renderAll();
        showToast("Student deleted successfully.");
    }
});

// Search and filter
searchInput.addEventListener("input", renderStudents);
statusFilter.addEventListener("change", renderStudents);

// Switch between website pages
function showPage(pageName) {
    const pages = {
        dashboard: "dashboardPage",
        students: "studentsPage",
        about: "aboutPage"
    };

    if (!pages[pageName]) {
        pageName = "dashboard";
    }

    Object.entries(pages).forEach(([name, elementId]) => {
        document.getElementById(elementId).classList.toggle(
            "hidden",
            name !== pageName
        );
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
    });

    const labels = {
        dashboard: "Dashboard",
        students: "Students",
        about: "About System"
    };

    document.getElementById("breadcrumb").textContent =
        labels[pageName];

    document.title = labels[pageName] + " | Campus SIS";

    document.getElementById("sidebar").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Sidebar navigation
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const pageName = this.dataset.page;

        showPage(pageName);
        history.replaceState(null, "", "#" + pageName);
    });
});

// Dashboard View All button
document.getElementById("viewAllStudents").addEventListener(
    "click",
    () => {
        showPage("students");
        history.replaceState(null, "", "#students");
    }
);

// Mobile sidebar
document.getElementById("menuToggle").addEventListener(
    "click",
    () => {
        document.getElementById("sidebar").classList.toggle("open");
    }
);

// Escape values safely for CSV
function csvCell(value) {
    let text = String(value ?? "");

    // Avoid spreadsheet formula execution for untrusted cell content.
    if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
}

// Export student records to CSV
document.getElementById("exportButton").addEventListener(
    "click",
    function () {
        if (students.length === 0) {
            showToast("There are no student records to export.");
            return;
        }

        const headers = [
            "Student ID",
            "First Name",
            "Last Name",
            "Email",
            "Course",
            "Year Level",
            "Gender",
            "Status"
        ];

        const rows = students.map(student => [
            student.studentId,
            student.firstName,
            student.lastName,
            student.email,
            student.course,
            student.yearLevel,
            student.gender,
            student.status
        ]);

        const csv = [
            headers.map(csvCell).join(","),
            ...rows.map(row => row.map(csvCell).join(","))
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "student-records.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        showToast("Student records exported successfully.");
    }
);

// Initialize the website
document.getElementById("currentYear").textContent =
    new Date().getFullYear();

renderAll();

const initialPage = window.location.hash.replace("#", "");

if (initialPage) {
    showPage(initialPage);
}
