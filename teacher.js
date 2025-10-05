// Teacher Dashboard functionality
class TeacherDashboard {
    constructor() {
        this.selectedStudent = null;
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.showSection('manage-students');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.teacher-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.teacher-nav-btn').dataset.section;
                this.showSection(section);
            });
        });

        // Student management
        document.getElementById('add-student-btn').addEventListener('click', () => this.showAddStudentModal());
        document.getElementById('cancel-add-student').addEventListener('click', () => this.hideAddStudentModal());
        document.getElementById('add-student-form').addEventListener('submit', (e) => this.addStudent(e));

        // Student search
        document.getElementById('student-search').addEventListener('input', (e) => this.searchStudents(e.target.value));

        // Announcements
        document.getElementById('announcement-form').addEventListener('submit', (e) => this.postAnnouncement(e));
        document.getElementById('view-announcements').addEventListener('click', () => this.viewAllAnnouncements());

        // Grades management
        document.getElementById('grade-student-select').addEventListener('change', (e) => this.selectStudentForGrades(e.target.value));
        document.getElementById('grade-form').addEventListener('submit', (e) => this.updateGrades(e));
        document.getElementById('course-filter').addEventListener('change', () => this.filterStudents());
        document.getElementById('year-filter').addEventListener('change', () => this.filterStudents());

        // Messages
        document.getElementById('teacher-message-form').addEventListener('submit', (e) => this.sendMessage(e));
        document.getElementById('bulk-message').addEventListener('click', () => this.bulkMessage());

        // Analytics
        document.getElementById('export-analytics').addEventListener('click', () => this.exportAnalytics());
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId).classList.add('active');

        // Update active navigation
        document.querySelectorAll('.teacher-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    loadDashboardData() {
        this.loadQuickStats();
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'manage-students':
                this.loadStudentsList();
                break;
            case 'post-announcements':
                // Nothing additional to load
                break;
            case 'manage-grades':
                this.loadGradeManagement();
                break;
            case 'teacher-messages':
                this.loadMessageStudents();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    loadQuickStats() {
        const students = sis.getStudents();
        const announcements = sis.getAnnouncements();
        
        document.getElementById('total-students').textContent = students.length;
        document.getElementById('announcements-count').textContent = announcements.length;
        
        // Count unique courses
        const courses = [...new Set(students.map(s => s.course))];
        document.getElementById('total-courses').textContent = courses.length;
    }

    loadStudentsList() {
        const students = sis.getStudents();
        const tableBody = document.getElementById('students-table-body');
        
        tableBody.innerHTML = students.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.course}</td>
                <td>${student.year}</td>
                <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
                <td>
                    <button class="btn-action edit-student" data-id="${student.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete-student" data-id="${student.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-action view-grades" data-id="${student.id}">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        tableBody.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', () => this.editStudent(btn.dataset.id));
        });

        tableBody.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', () => this.deleteStudent(btn.dataset.id));
        });

        tableBody.querySelectorAll('.view-grades').forEach(btn => {
            btn.addEventListener('click', () => this.viewStudentGrades(btn.dataset.id));
        });

        this.loadQuickStats();
    }

    searchStudents(query) {
        const students = sis.getStudents();
        const tableBody = document.getElementById('students-table-body');
        
        const filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.id.toLowerCase().includes(query.toLowerCase()) ||
            student.course.toLowerCase().includes(query.toLowerCase()) ||
            student.email.toLowerCase().includes(query.toLowerCase())
        );

        tableBody.innerHTML = filteredStudents.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.course}</td>
                <td>${student.year}</td>
                <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
                <td>
                    <button class="btn-action edit-student" data-id="${student.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete-student" data-id="${student.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-action view-grades" data-id="${student.id}">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Re-add event listeners
        tableBody.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', () => this.editStudent(btn.dataset.id));
        });

        tableBody.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', () => this.deleteStudent(btn.dataset.id));
        });

        tableBody.querySelectorAll('.view-grades').forEach(btn => {
            btn.addEventListener('click', () => this.viewStudentGrades(btn.dataset.id));
        });
    }

    showAddStudentModal() {
        document.getElementById('add-student-modal').classList.remove('hidden');
    }

    hideAddStudentModal() {
        document.getElementById('add-student-modal').classList.add('hidden');
        document.getElementById('add-student-form').reset();
    }

    addStudent(e) {
        e.preventDefault();
        
        const name = document.getElementById('new-student-name').value;
        const id = document.getElementById('new-student-id').value;
        const email = document.getElementById('new-student-email').value;
        const course = document.getElementById('new-student-course').value;
        const year = document.getElementById('new-student-year').value;

        const students = sis.getStudents();

        // Check if student ID already exists
        if (students.find(s => s.id === id)) {
            sis.showToast('Student ID already exists!', 'error');
            return;
        }

        // Add new student
        students.push({ id, name, email, course, year, status: "Active" });
        sis.saveStudents(students);

        // Initialize empty grades for new student
        const grades = sis.getGrades();
        grades[id] = [];
        sis.saveGrades(grades);

        // Initialize empty messages for new student
        const messages = sis.getMessages();
        messages[id] = [];
        sis.saveMessages(messages);

        this.hideAddStudentModal();
        this.loadStudentsList();
        sis.showToast('Student added successfully!', 'success');
    }

    editStudent(studentId) {
        const students = sis.getStudents();
        const student = students.find(s => s.id === studentId);
        
        if (student) {
            // In a real app, this would open an edit form
            sis.showToast(`Edit student: ${student.name} (${studentId})`, 'info');
        }
    }

    deleteStudent(studentId) {
        if (confirm(`Are you sure you want to delete student ${studentId}?`)) {
            let students = sis.getStudents();
            students = students.filter(s => s.id !== studentId);
            sis.saveStudents(students);

            // Also remove from grades
            let grades = sis.getGrades();
            delete grades[studentId];
            sis.saveGrades(grades);

            // Also remove from messages
            let messages = sis.getMessages();
            delete messages[studentId];
            sis.saveMessages(messages);

            this.loadStudentsList();
            sis.showToast('Student deleted successfully!', 'success');
        }
    }

    viewStudentGrades(studentId) {
        this.showSection('manage-grades');
        document.getElementById('grade-student-select').value = studentId;
        this.selectStudentForGrades(studentId);
    }

    loadGradeManagement() {
        const students = sis.getStudents();
        const studentSelect = document.getElementById('grade-student-select');
        
        studentSelect.innerHTML = '<option value="">Choose a student</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.id})`;
            studentSelect.appendChild(option);
        });

        // Load filters
        this.loadFilters();
    }

    loadFilters() {
        const students = sis.getStudents();
        const courseFilter = document.getElementById('course-filter');
        const yearFilter = document.getElementById('year-filter');

        // Get unique courses and years
        const courses = [...new Set(students.map(s => s.course))];
        const years = [...new Set(students.map(s => s.year))];

        courseFilter.innerHTML = '<option value="">All Courses</option>';
        yearFilter.innerHTML = '<option value="">All Years</option>';

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseFilter.appendChild(option);
        });

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    filterStudents() {
        const courseFilter = document.getElementById('course-filter').value;
        const yearFilter = document.getElementById('year-filter').value;
        const studentSelect = document.getElementById('grade-student-select');
        
        const students = sis.getStudents();
        const filteredStudents = students.filter(student => 
            (!courseFilter || student.course === courseFilter) &&
            (!yearFilter || student.year === yearFilter)
        );

        studentSelect.innerHTML = '<option value="">Choose a student</option>';
        filteredStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.id})`;
            studentSelect.appendChild(option);
        });
    }

    selectStudentForGrades(studentId) {
        if (!studentId) {
            document.getElementById('grade-form-container').classList.add('hidden');
            return;
        }

        const students = sis.getStudents();
        const student = students.find(s => s.id === studentId);
        const grades = sis.getGrades()[studentId] || [];

        document.getElementById('selected-student-name').textContent = student.name;
        
        const inputsContainer = document.getElementById('grade-inputs-container');
        inputsContainer.innerHTML = '';

        if (grades.length === 0) {
            // Add default subjects if no grades exist
            const defaultSubjects = this.getDefaultSubjects(student.course);
            defaultSubjects.forEach(subject => {
                const div = document.createElement('div');
                div.className = 'grade-input-group';
                div.innerHTML = `
                    <label>${subject}</label>
                    <input type="number" step="0.01" min="1.0" max="4.0" value="1.0" data-subject="${subject}">
                `;
                inputsContainer.appendChild(div);
            });
        } else {
            grades.forEach(grade => {
                const div = document.createElement('div');
                div.className = 'grade-input-group';
                div.innerHTML = `
                    <label>${grade.subject} (${grade.units} units)</label>
                    <input type="number" step="0.01" min="1.0" max="4.0" value="${grade.grade}" data-subject="${grade.subject}">
                `;
                inputsContainer.appendChild(div);
            });
        }

        document.getElementById('grade-form-container').classList.remove('hidden');
    }

    getDefaultSubjects(course) {
        const subjectMap = {
            'Computer Science': ['Mathematics', 'Programming', 'Database Systems', 'Web Development', 'Algorithms'],
            'Business Administration': ['Accounting', 'Marketing', 'Management', 'Economics'],
            'Engineering': ['Physics', 'Calculus', 'Engineering Design', 'Materials Science'],
            'Psychology': ['Introduction to Psychology', 'Social Psychology', 'Cognitive Psychology', 'Research Methods']
        };
        
        return subjectMap[course] || ['Subject 1', 'Subject 2', 'Subject 3'];
    }

    updateGrades(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('grade-student-select').value;
        const grades = sis.getGrades();
        const inputs = document.querySelectorAll('#grade-inputs-container input');
        
        if (!studentId) return;

        const studentGrades = [];
        inputs.forEach(input => {
            studentGrades.push({
                subject: input.dataset.subject,
                units: 3, // Default units
                grade: parseFloat(input.value),
                trend: 'stable' // Default trend
            });
        });

        grades[studentId] = studentGrades;
        sis.saveGrades(grades);

        sis.showToast('Grades updated successfully!', 'success');
    }

    postAnnouncement(e) {
        e.preventDefault();
        
        const title = document.getElementById('announcement-title').value;
        const content = document.getElementById('announcement-content').value;
        const priority = document.getElementById('announcement-priority').value;

        const announcements = sis.getAnnouncements();
        const newAnnouncement = {
            id: announcements.length + 1,
            title,
            content,
            author: sis.currentUser.name,
            date: new Date().toISOString().split('T')[0],
            priority
        };

        announcements.unshift(newAnnouncement);
        sis.saveAnnouncements(announcements);

        document.getElementById('announcement-form').reset();
        this.loadQuickStats();
        sis.showToast('Announcement posted successfully!', 'success');
    }

    viewAllAnnouncements() {
        const announcements = sis.getAnnouncements();
        let message = `Total Announcements: ${announcements.length}\n\n`;
        
        announcements.forEach(announcement => {
            message += `${announcement.title} (${announcement.priority})\n`;
            message += `By ${announcement.author} on ${announcement.date}\n`;
            message += `${announcement.content}\n\n`;
        });

        alert(message);
    }

    loadMessageStudents() {
        const students = sis.getStudents();
        const studentSelect = document.getElementById('message-student-select');
        
        studentSelect.innerHTML = '<option value="">Choose a student</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.id})`;
            studentSelect.appendChild(option);
        });
    }

    sendMessage(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('message-student-select').value;
        const subject = document.getElementById('teacher-message-subject').value;
        const content = document.getElementById('teacher-message-content').value;

        if (!studentId) {
            sis.showToast('Please select a student', 'error');
            return;
        }

        const messages = sis.getMessages();
        if (!messages[studentId]) {
            messages[studentId] = [];
        }

        const newMessage = {
            id: messages[studentId].length + 1,
            subject,
            content,
            sender: sis.currentUser.name,
            date: new Date().toISOString().split('T')[0],
            read: false
        };

        messages[studentId].push(newMessage);
        sis.saveMessages(messages);

        document.getElementById('teacher-message-form').reset();
        sis.showToast('Message sent successfully!', 'success');
    }

    bulkMessage() {
        sis.showToast('Bulk message feature would open here', 'info');
    }

    loadAnalytics() {
        this.loadGradeDistribution();
        this.loadCoursePerformance();
        this.loadAttendanceStats();
    }

    loadGradeDistribution() {
        const grades = sis.getGrades();
        const allGrades = Object.values(grades).flat();
        
        const gradeRanges = {
            '1.0 - 1.5': 0,
            '1.51 - 2.0': 0,
            '2.01 - 2.5': 0,
            '2.51 - 3.0': 0,
            '3.01 - 4.0': 0
        };

        allGrades.forEach(grade => {
            if (grade.grade <= 1.5) gradeRanges['1.0 - 1.5']++;
            else if (grade.grade <= 2.0) gradeRanges['1.51 - 2.0']++;
            else if (grade.grade <= 2.5) gradeRanges['2.01 - 2.5']++;
            else if (grade.grade <= 3.0) gradeRanges['2.51 - 3.0']++;
            else gradeRanges['3.01 - 4.0']++;
        });

        // Update chart (simplified)
        const chartContainer = document.querySelector('#grade-distribution-chart').parentElement;
        chartContainer.innerHTML = `
            <div class="grade-distribution">
                ${Object.entries(gradeRanges).map(([range, count]) => `
                    <div class="distribution-item">
                        <span class="range">${range}</span>
                        <div class="bar-container">
                            <div class="bar" style="width: ${(count / allGrades.length) * 100}%"></div>
                        </div>
                        <span class="count">${count}</span>
                    </div>
                `).join('')}
            </div>
            <style>
                .grade-distribution { padding: 20px; }
                .distribution-item { display: flex; align-items: center; margin-bottom: 10px; }
                .range { width: 80px; font-size: 0.9rem; }
                .bar-container { flex: 1; background: #e2e8f0; height: 20px; border-radius: 10px; margin: 0 10px; overflow: hidden; }
                .bar { background: #3b82f6; height: 100%; transition: width 0.3s ease; }
                .count { width: 30px; text-align: right; font-weight: 600; }
            </style>
        `;
    }

    loadCoursePerformance() {
        const students = sis.getStudents();
        const grades = sis.getGrades();
        
        const coursePerformance = {};
        
        students.forEach(student => {
            const studentGrades = grades[student.id] || [];
            if (studentGrades.length > 0) {
                const average = studentGrades.reduce((sum, grade) => sum + grade.grade, 0) / studentGrades.length;
                
                if (!coursePerformance[student.course]) {
                    coursePerformance[student.course] = { total: 0, count: 0 };
                }
                
                coursePerformance[student.course].total += average;
                coursePerformance[student.course].count++;
            }
        });

        // Update chart (simplified)
        const chartContainer = document.querySelector('#course-performance-chart').parentElement;
        
        if (Object.keys(coursePerformance).length === 0) {
            chartContainer.innerHTML = '<p class="text-center">No grade data available</p>';
            return;
        }

        chartContainer.innerHTML = `
            <div class="course-performance">
                ${Object.entries(coursePerformance).map(([course, data]) => {
                    const average = (data.total / data.count).toFixed(2);
                    return `
                        <div class="course-item">
                            <span class="course-name">${course}</span>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: ${(1 - (average - 1) / 3) * 100}%"></div>
                            </div>
                            <span class="course-average">${average}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <style>
                .course-performance { padding: 20px; }
                .course-item { display: flex; align-items: center; margin-bottom: 15px; }
                .course-name { width: 150px; font-size: 0.9rem; }
                .performance-bar { flex: 1; background: #e2e8f0; height: 20px; border-radius: 10px; margin: 0 10px; overflow: hidden; }
                .performance-fill { background: #10b981; height: 100%; transition: width 0.3s ease; }
                .course-average { width: 40px; text-align: right; font-weight: 600; }
            </style>
        `;
    }

    loadAttendanceStats() {
        // Simulated attendance data
        const presentCount = Math.floor(Math.random() * 50) + 70; // 70-120
        const absentCount = Math.floor(Math.random() * 10) + 5;   // 5-15
        const lateCount = Math.floor(Math.random() * 15) + 10;    // 10-25

        document.getElementById('present-count').textContent = presentCount;
        document.getElementById('absent-count').textContent = absentCount;
        document.getElementById('late-count').textContent = lateCount;
    }

    exportAnalytics() {
        sis.showToast('Analytics data exported successfully!', 'success');
        // In a real app, this would generate and download a CSV/PDF report
    }
}

// Initialize teacher dashboard
const teacherDashboard = new TeacherDashboard();