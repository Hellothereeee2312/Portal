// Main application initialization and shared functionality
class StudentInformationSystem {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.isDarkMode = false;
        this.init();
    }

    init() {
        this.initializeData();
        this.setupEventListeners();
        this.checkExistingSession();
    }

    // Sample data initialization
    initializeData() {
        if (localStorage.getItem('sis_initialized')) return;

        const sampleStudents = [
            { id: "S2023001", name: "John Vhincent Mark Reyes", email: "john.doe@student.edu", course: "Computer Science", year: "3rd Year", status: "Active" },
            { id: "S2023002", name: "Jane Smith", email: "jane.smith@student.edu", course: "Business Administration", year: "2nd Year", status: "Active" },
            { id: "S2023003", name: "Michael Johnson", email: "michael.johnson@student.edu", course: "Engineering", year: "4th Year", status: "Active" },
            { id: "S2023004", name: "Emily Davis", email: "emily.davis@student.edu", course: "Psychology", year: "1st Year", status: "Active" }
        ];

        const sampleGrades = {
            "S2023001": [
                { subject: "PRACTICUM 1", units: 3, grade: 1.75, trend: "up" },
                { subject: "PRACTICUM 2", units: 3, grade: 1.50, trend: "stable" },
                { subject: "Database Systems", units: 3, grade: 1.25, trend: "up" },
                { subject: "SA101", units: 3, grade: 1.00, trend: "up" },
                { subject: "IPT2", units: 3, grade: 1.50, trend: "down" }
            ],
            "S2023002": [
                { subject: "Accounting", units: 3, grade: 2.00, trend: "stable" },
                { subject: "Marketing", units: 3, grade: 1.75, trend: "up" },
                { subject: "Management", units: 3, grade: 2.25, trend: "down" },
                { subject: "Economics", units: 3, grade: 1.50, trend: "up" }
            ]
        };

        const sampleSchedule = [
            { time: "8:00 - 9:30", monday: "PRACTICUM 1 ", tuesday: "PRACTICUM 2", wednesday: "Mathematics", thursday: "Programming", friday: "Algorithms" },
            { time: "9:30 - 11:00", monday: "Web Development", tuesday: "Database Systems", wednesday: "Web Development", thursday: "Database Systems", friday: "Free" },
            { time: "11:00 - 12:30", monday: "Free", tuesday: "Algorithms", wednesday: "Free", thursday: "Algorithms", friday: "Mathematics" },
            { time: "1:30 - 3:00", monday: "Database Systems", tuesday: "Web Development", wednesday: "Database Systems", thursday: "Web Development", friday: "Programming" },
            { time: "3:00 - 4:30", monday: "Algorithms", tuesday: "Mathematics", wednesday: "Algorithms", thursday: "Mathematics", friday: "Free" }
        ];

        const announcements = [
            { id: 1, title: "Midterm Examination Schedule", content: "The midterm examinations will be held from October 15 to October 20. Please check your schedule and prepare accordingly.", date: "2023-10-01", author: "Academic Office", priority: "high" },
            { id: 2, title: "Library Closure", content: "The main library will be closed for maintenance on October 12. We apologize for any inconvenience.", date: "2023-10-05", author: "Library Administration", priority: "normal" },
            { id: 3, title: "Scholarship Applications", content: "Applications for the semester scholarship program are now open. Deadline is October 30.", date: "2023-10-08", author: "Financial Aid Office", priority: "high" }
        ];

        const messages = {
            "S2023001": [
                { id: 1, subject: "Regarding your assignment", content: "Hello John, I wanted to discuss your recent assignment submission. Please see me during my office hours.", sender: "Dr. Smith", date: "2023-10-10", read: false },
                { id: 2, subject: "Class cancellation", content: "Class for tomorrow has been cancelled due to unforeseen circumstances. We will resume on Thursday.", sender: "Prof. Johnson", date: "2023-10-08", read: true }
            ]
        };

        const resources = [
            { id: 1, title: "Programming Fundamentals", type: "textbook", course: "Computer Science", uploadDate: "2023-09-15" },
            { id: 2, title: "Database Design Slides", type: "slides", course: "Database Systems", uploadDate: "2023-09-20" },
            { id: 3, title: "Web Development Tutorial", type: "video", course: "Web Development", uploadDate: "2023-09-25" }
        ];

        localStorage.setItem('students', JSON.stringify(sampleStudents));
        localStorage.setItem('grades', JSON.stringify(sampleGrades));
        localStorage.setItem('schedule', JSON.stringify(sampleSchedule));
        localStorage.setItem('announcements', JSON.stringify(announcements));
        localStorage.setItem('messages', JSON.stringify(messages));
        localStorage.setItem('resources', JSON.stringify(resources));
        localStorage.setItem('sis_initialized', 'true');
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Role selection
        document.getElementById('student-btn').addEventListener('click', () => this.switchRole('student'));
        document.getElementById('teacher-btn').addEventListener('click', () => this.switchRole('teacher'));

        // Theme toggles
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('teacher-theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Logout buttons
        document.getElementById('student-logout').addEventListener('click', () => this.logout());
        document.getElementById('teacher-logout').addEventListener('click', () => this.logout());

        // Modal controls
        this.setupModalListeners();
    }

    switchRole(role) {
        const studentBtn = document.getElementById('student-btn');
        const teacherBtn = document.getElementById('teacher-btn');
        
        studentBtn.classList.toggle('active', role === 'student');
        teacherBtn.classList.toggle('active', role === 'teacher');
    }

    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const isStudent = document.getElementById('student-btn').classList.contains('active');
        
        if (isStudent) {
            if (username === 'student1' && password === '1234') {
                this.currentUser = { id: "S2023001", name: "John Vhincent Mark Reyes", role: "student" };
                this.currentRole = "student";
                this.showStudentDashboard();
            } else {
                this.showToast('Invalid student credentials. Use: student1 / 1234', 'error');
            }
        } else {
            if (username === 'admin' && password === '12e') {
                this.currentUser = { id: "T001", name: "Mr. Chiong", role: "teacher" };
                this.currentRole = "teacher";
                this.showTeacherDashboard();
            } else {
                this.showToast('Invalid teacher credentials. Use: admin / 12e', 'error');
            }
        }
    }

    showStudentDashboard() {
        this.showPage('student-dashboard');
        document.getElementById('student-name').textContent = this.currentUser.name;
        
        // Initialize student-specific functionality
        if (typeof studentDashboard !== 'undefined') {
            studentDashboard.init();
        }
        
        this.showToast(`Welcome back, ${this.currentUser.name}!`, 'success');
    }

    showTeacherDashboard() {
        this.showPage('teacher-dashboard');
        document.getElementById('teacher-name').textContent = this.currentUser.name;
        
        // Initialize teacher-specific functionality
        if (typeof teacherDashboard !== 'undefined') {
            teacherDashboard.init();
        }
        
        this.showToast(`Welcome, ${this.currentUser.name}!`, 'success');
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        localStorage.setItem('darkMode', this.isDarkMode);
        
        const icons = document.querySelectorAll('.theme-toggle-icon, #theme-toggle i, #teacher-theme-toggle i');
        icons.forEach(icon => {
            icon.classList.toggle('fa-moon', !this.isDarkMode);
            icon.classList.toggle('fa-sun', this.isDarkMode);
        });
    }

    checkExistingSession() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
        }
    }

    setupModalListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });

        // Close modals with close button
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    logout() {
        this.currentUser = null;
        this.currentRole = null;
        this.showPage('login-page');
        document.getElementById('login-form').reset();
        this.showToast('You have been logged out successfully.', 'info');
    }

    // Utility methods
    getStudents() {
        return JSON.parse(localStorage.getItem('students') || '[]');
    }

    getGrades() {
        return JSON.parse(localStorage.getItem('grades') || '{}');
    }

    

    getMessages() {
        return JSON.parse(localStorage.getItem('messages') || '{}');
    }

    saveStudents(students) {
        localStorage.setItem('students', JSON.stringify(students));
    }

    saveGrades(grades) {
        localStorage.setItem('grades', JSON.stringify(grades));
    }

    saveAnnouncements(announcements) {
        localStorage.setItem('announcements', JSON.stringify(announcements));
    }

    saveMessages(messages) {
        localStorage.setItem('messages', JSON.stringify(messages));
    }
}

// Initialize the application

const sis = new StudentInformationSystem();

