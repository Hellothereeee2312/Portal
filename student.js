// Student Dashboard functionality
class StudentDashboard {
    constructor() {
        this.currentWeek = 1;
        this.selectedMessage = null;
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.showSection('profile');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.nav-btn').dataset.section;
                this.showSection(section);
            });
        });

        // Profile editing
        document.getElementById('edit-profile').addEventListener('click', () => this.toggleProfileEdit(true));
        document.getElementById('cancel-edit').addEventListener('click', () => this.toggleProfileEdit(false));
        document.getElementById('save-profile').addEventListener('click', () => this.saveProfile());

        // Grades
        document.getElementById('export-grades').addEventListener('click', () => this.exportGrades());
        document.getElementById('simulate-grades').addEventListener('click', () => this.simulateGradeUpdate());

        // Schedule
        document.getElementById('prev-week').addEventListener('click', () => this.changeWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => this.changeWeek(1));

        // Announcements
        document.getElementById('refresh-announcements').addEventListener('click', () => this.refreshAnnouncements());

        // Messages
        document.getElementById('new-message').addEventListener('click', () => this.newMessage());
        document.getElementById('reply-btn').addEventListener('click', () => this.showReplyModal());
        document.getElementById('cancel-reply').addEventListener('click', () => this.hideReplyModal());
        document.getElementById('reply-form').addEventListener('submit', (e) => this.sendReply(e));
        document.getElementById('delete-message').addEventListener('click', () => this.deleteMessage());

        // Resources
        document.getElementById('upload-resource').addEventListener('click', () => this.uploadResource());

        // Message search
        document.getElementById('message-search').addEventListener('input', (e) => this.searchMessages(e.target.value));
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId).classList.add('active');

        // Update active navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    loadDashboardData() {
        this.loadProfile();
        this.loadQuickStats();
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'profile':
                this.loadProfile();
                break;
            case 'grades':
                this.loadGrades();
                break;
            case 'schedule':
                this.loadSchedule();
                break;
            
            case 'messages':
                this.loadMessages();
                break;
            case 'resources':
                this.loadResources();
                break;
        }
    }

    loadQuickStats() {
        const grades = sis.getGrades()[sis.currentUser.id] || [];
        const messages = sis.getMessages()[sis.currentUser.id] || [];
        const unreadCount = messages.filter(msg => !msg.read).length;

        document.getElementById('total-subjects').textContent = grades.length;
        document.getElementById('unread-count').textContent = unreadCount;

        // Update notification badge
        const badge = document.querySelector('.notification-badge');
        if (unreadCount > 0) {
            badge.classList.remove('hidden');
            badge.textContent = unreadCount;
        } else {
            badge.classList.add('hidden');
        }

        // Calculate average
        if (grades.length > 0) {
            const average = grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
            document.getElementById('current-average').textContent = average.toFixed(2);
        }
    }

    loadProfile() {
        const students = sis.getStudents();
        const student = students.find(s => s.id === sis.currentUser.id);
        
        if (student) {
            document.getElementById('profile-name').textContent = student.name;
            document.getElementById('profile-email').textContent = student.email;
            document.getElementById('profile-course').textContent = student.course;
            document.getElementById('profile-year').textContent = student.year;
            
            // Set edit form values
            document.getElementById('edit-name').value = student.name;
            document.getElementById('edit-email').value = student.email;
            document.getElementById('edit-course').value = student.course;
            document.getElementById('edit-year').value = student.year;
        }
    }

    toggleProfileEdit(editing) {
        const elementsToHide = ['profile-name', 'profile-email', 'profile-course', 'profile-year'];
        const elementsToShow = ['edit-name', 'edit-email', 'edit-course', 'edit-year'];

        elementsToHide.forEach(id => {
            document.getElementById(id).classList.toggle('hidden', editing);
        });

        elementsToShow.forEach(id => {
            document.getElementById(id).classList.toggle('hidden', !editing);
        });

        document.getElementById('save-profile-container').classList.toggle('hidden', !editing);
        document.getElementById('edit-profile').classList.toggle('hidden', editing);
    }

    saveProfile() {
        const name = document.getElementById('edit-name').value;
        const email = document.getElementById('edit-email').value;
        const course = document.getElementById('edit-course').value;
        const year = document.getElementById('edit-year').value;

        const students = sis.getStudents();
        const studentIndex = students.findIndex(s => s.id === sis.currentUser.id);

        if (studentIndex !== -1) {
            students[studentIndex] = { ...students[studentIndex], name, email, course, year };
            sis.saveStudents(students);
            
            // Update current user
            sis.currentUser.name = name;
            document.getElementById('student-name').textContent = name;

            this.toggleProfileEdit(false);
            this.loadProfile();
            sis.showToast('Profile updated successfully!', 'success');
        }
    }

    loadGrades() {
        const grades = sis.getGrades()[sis.currentUser.id] || [];
        const tableBody = document.getElementById('grades-table-body');
        tableBody.innerHTML = '';

        let totalUnits = 0;
        let totalGradePoints = 0;

        grades.forEach(grade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${grade.subject}</td>
                <td>${grade.units}</td>
                <td>${grade.grade}</td>
                <td>${this.getGradeRemarks(grade.grade)}</td>
                <td><i class="fas fa-arrow-${grade.trend} text-${grade.trend === 'up' ? 'success' : grade.trend === 'down' ? 'danger' : 'warning'}"></i></td>
            `;
            tableBody.appendChild(row);

            totalUnits += grade.units;
            totalGradePoints += grade.grade * grade.units;
        });

        // Calculate and display average
        const average = totalUnits > 0 ? (totalGradePoints / totalUnits).toFixed(2) : "0.00";
        document.getElementById('general-average').textContent = average;
        document.getElementById('current-average').textContent = average;

        // Update status
        const status = parseFloat(average) <= 2.0 ? "Passed" : "Failed";
        const statusClass = parseFloat(average) <= 2.0 ? "status-passed" : "status-failed";
        document.getElementById('grade-status').textContent = status;
        document.getElementById('grade-status').className = statusClass;

        // Update chart if available
        this.updateGradeChart(grades);
    }

    getGradeRemarks(grade) {
        if (grade <= 1.0) return "Excellent";
        if (grade <= 1.5) return "Very Good";
        if (grade <= 2.0) return "Good";
        if (grade <= 2.5) return "Fair";
        if (grade <= 3.0) return "Pass";
        return "Fail";
    }

    updateGradeChart(grades) {
        const ctx = document.getElementById('grade-chart');
        if (!ctx) return;

        // Simple chart implementation - in a real app, use Chart.js
        const chartContent = document.querySelector('.chart-container');
        if (grades.length === 0) {
            chartContent.innerHTML = '<p class="text-center">No grade data available</p>';
            return;
        }

        // Create a simple bar chart using CSS
        const chartBars = grades.map(grade => `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${(1 - (grade.grade - 1) / 3) * 100}%"></div>
                <span class="chart-label">${grade.subject.substring(0, 3)}</span>
            </div>
        `).join('');

        chartContent.innerHTML = `
            <div class="chart-bars">${chartBars}</div>
            <style>
                .chart-bars { display: flex; height: 150px; align-items: end; gap: 10px; padding: 0 20px; }
                .chart-bar-container { flex: 1; text-align: center; }
                .chart-bar { background: #3b82f6; border-radius: 4px 4px 0 0; transition: height 0.3s ease; }
                .chart-label { font-size: 0.8rem; margin-top: 5px; }
            </style>
        `;
    }

    exportGrades() {
        const grades = sis.getGrades()[sis.currentUser.id] || [];
        let csvContent = "Subject,Units,Grade,Remarks\n";
        
        grades.forEach(grade => {
            csvContent += `${grade.subject},${grade.units},${grade.grade},${this.getGradeRemarks(grade.grade)}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_grades.csv';
        a.click();
        
        sis.showToast('Grades exported successfully!', 'success');
    }

    simulateGradeUpdate() {
        sis.showToast('Simulating grade update...', 'info');
        setTimeout(() => {
            this.loadGrades();
            this.loadQuickStats();
            sis.showToast('Grades updated successfully!', 'success');
        }, 1500);
    }

    loadSchedule() {
        const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
        const grid = document.getElementById('schedule-grid');
        
        if (!grid) return;

        // Create schedule header
        let scheduleHTML = `
            <div class="schedule-header"></div>
            <div class="schedule-header">Monday</div>
            <div class="schedule-header">Tuesday</div>
            <div class="schedule-header">Wednesday</div>
            <div class="schedule-header">Thursday</div>
            <div class="schedule-header">Friday</div>
        `;

        // Create schedule cells
        schedule.forEach(slot => {
            scheduleHTML += `
                <div class="schedule-header">${slot.time}</div>
                <div class="schedule-cell ${this.isCurrentClass(slot.monday) ? 'current' : ''}">${slot.monday}</div>
                <div class="schedule-cell ${this.isCurrentClass(slot.tuesday) ? 'current' : ''}">${slot.tuesday}</div>
                <div class="schedule-cell ${this.isCurrentClass(slot.wednesday) ? 'current' : ''}">${slot.wednesday}</div>
                <div class="schedule-cell ${this.isCurrentClass(slot.thursday) ? 'current' : ''}">${slot.thursday}</div>
                <div class="schedule-cell ${this.isCurrentClass(slot.friday) ? 'current' : ''}">${slot.friday}</div>
            `;
        });

        grid.innerHTML = scheduleHTML;
        this.loadUpcomingClasses();
    }

    isCurrentClass(className) {
        // Simple simulation - mark "Programming" as current class
        return className === "Programming";
    }

    loadUpcomingClasses() {
        const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
        const container = document.getElementById('upcoming-classes-list');
        
        if (!container) return;

        // Get next 3 classes (simulated)
        const upcomingClasses = [
            { time: "Today, 9:30 AM", subject: "Programming", room: "Room 301" },
            { time: "Tomorrow, 8:00 AM", subject: "Mathematics", room: "Room 205" },
            { time: "Tomorrow, 1:30 PM", subject: "Database Systems", room: "Room 412" }
        ];

        container.innerHTML = upcomingClasses.map(cls => `
            <div class="upcoming-class">
                <h4>${cls.subject}</h4>
                <p>${cls.time}</p>
                <small>${cls.room}</small>
            </div>
        `).join('');
    }

    changeWeek(direction) {
        this.currentWeek += direction;
        if (this.currentWeek < 1) this.currentWeek = 1;
        if (this.currentWeek > 4) this.currentWeek = 4;
        
        document.getElementById('current-week').textContent = `Week ${this.currentWeek}`;
        this.loadSchedule();
    }

    loadAnnouncements() {
        const announcements = sis.getAnnouncements();
        const container = document.getElementById('announcements-list');
        
        if (!container) return;

        container.innerHTML = announcements.map(announcement => `
            <div class="announcement-card ${announcement.priority}">
                <div class="announcement-header">
                    <h3 class="announcement-title">${announcement.title}</h3>
                    <span class="announcement-priority">${announcement.priority.toUpperCase()}</span>
                </div>
                <div class="announcement-meta">
                    By ${announcement.author} • ${announcement.date}
                </div>
                <div class="announcement-content">
                    ${announcement.content}
                </div>
            </div>
        `).join('');
    }

    refreshAnnouncements() {
        sis.showToast('Checking for new announcements...', 'info');
        
        setTimeout(() => {
            // Simulate new announcement
            const announcements = sis.getAnnouncements();
            const newAnnouncement = {
                id: announcements.length + 1,
                title: "New System Update",
                content: "The student portal has been updated with new features. Check out the resources section!",
                date: new Date().toISOString().split('T')[0],
                author: "System Admin",
                priority: "normal"
            };
            
            announcements.unshift(newAnnouncement);
            sis.saveAnnouncements(announcements);
            
            this.loadAnnouncements();
            this.loadQuickStats();
            sis.showToast('New announcements loaded!', 'success');
        }, 1000);
    }

    loadMessages() {
        const messages = sis.getMessages()[sis.currentUser.id] || [];
        const container = document.getElementById('messages-list');
        
        if (!container) return;

        container.innerHTML = messages.map(message => `
            <div class="message-item ${message.read ? '' : 'unread'}" data-message-id="${message.id}">
                <div class="message-preview">
                    <div>
                        <h4>${message.subject}</h4>
                        <p>${message.sender}</p>
                        <p class="message-preview-text">${message.content.substring(0, 60)}...</p>
                    </div>
                    <span class="message-time">${message.date}</span>
                </div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => this.selectMessage(item.dataset.messageId));
        });

        this.loadQuickStats();
    }

    selectMessage(messageId) {
        const messages = sis.getMessages()[sis.currentUser.id] || [];
        this.selectedMessage = messages.find(msg => msg.id == messageId);
        
        if (!this.selectedMessage) return;

        // Mark as read
        if (!this.selectedMessage.read) {
            this.selectedMessage.read = true;
            const allMessages = sis.getMessages();
            allMessages[sis.currentUser.id] = messages;
            sis.saveMessages(allMessages);
            this.loadMessages();
        }

        // Show message details
        document.getElementById('no-message').classList.add('hidden');
        document.getElementById('message-detail').classList.remove('hidden');
        
        document.getElementById('message-subject').textContent = this.selectedMessage.subject;
        document.getElementById('message-sender').textContent = `From: ${this.selectedMessage.sender}`;
        document.getElementById('message-date').textContent = this.selectedMessage.date;
        document.getElementById('message-content').textContent = this.selectedMessage.content;

        // Set reply subject
        document.getElementById('reply-subject').value = `Re: ${this.selectedMessage.subject}`;
    }

    searchMessages(query) {
        const messages = sis.getMessages()[sis.currentUser.id] || [];
        const container = document.getElementById('messages-list');
        
        if (!container) return;

        const filteredMessages = messages.filter(msg => 
            msg.subject.toLowerCase().includes(query.toLowerCase()) ||
            msg.sender.toLowerCase().includes(query.toLowerCase()) ||
            msg.content.toLowerCase().includes(query.toLowerCase())
        );

        container.innerHTML = filteredMessages.map(message => `
            <div class="message-item ${message.read ? '' : 'unread'}" data-message-id="${message.id}">
                <div class="message-preview">
                    <div>
                        <h4>${message.subject}</h4>
                        <p>${message.sender}</p>
                        <p class="message-preview-text">${message.content.substring(0, 60)}...</p>
                    </div>
                    <span class="message-time">${message.date}</span>
                </div>
            </div>
        `).join('');

        // Re-add click listeners
        container.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => this.selectMessage(item.dataset.messageId));
        });
    }

    newMessage() {
        sis.showToast('New message feature would open here', 'info');
    }

    showReplyModal() {
        if (!this.selectedMessage) return;
        document.getElementById('reply-modal').classList.remove('hidden');
    }

    hideReplyModal() {
        document.getElementById('reply-modal').classList.add('hidden');
        document.getElementById('reply-content').value = '';
    }

    sendReply(e) {
        e.preventDefault();
        const content = document.getElementById('reply-content').value;
        
        if (!content.trim()) {
            sis.showToast('Please enter a message', 'error');
            return;
        }

        // Simulate sending reply
        sis.showToast('Reply sent successfully!', 'success');
        this.hideReplyModal();
    }

    deleteMessage() {
        if (!this.selectedMessage) return;

        if (confirm('Are you sure you want to delete this message?')) {
            const messages = sis.getMessages()[sis.currentUser.id] || [];
            const updatedMessages = messages.filter(msg => msg.id !== this.selectedMessage.id);
            
            const allMessages = sis.getMessages();
            allMessages[sis.currentUser.id] = updatedMessages;
            sis.saveMessages(allMessages);

            this.selectedMessage = null;
            this.loadMessages();
            
            document.getElementById('no-message').classList.remove('hidden');
            document.getElementById('message-detail').classList.add('hidden');
            
            sis.showToast('Message deleted successfully!', 'success');
        }
    }

    loadResources() {
        const resources = JSON.parse(localStorage.getItem('resources') || '[]');
        const container = document.getElementById('resources-grid');
        
        if (!container) return;

        container.innerHTML = resources.map(resource => `
            <div class="resource-card">
                <div class="resource-icon">
                    <i class="fas fa-${this.getResourceIcon(resource.type)}"></i>
                </div>
                <h3>${resource.title}</h3>
                <p>${resource.course} • ${resource.type}</p>
                <p><small>Uploaded: ${resource.uploadDate}</small></p>
                <div class="resource-actions">
                    <button class="btn-primary" onclick="studentDashboard.downloadResource(${resource.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn-secondary">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    getResourceIcon(type) {
        const icons = {
            'textbook': 'book',
            'slides': 'file-powerpoint',
            'video': 'video',
            'document': 'file-alt'
        };
        return icons[type] || 'file';
    }

    downloadResource(resourceId) {
        sis.showToast('Downloading resource...', 'info');
        // Simulate download
        setTimeout(() => {
            sis.showToast('Resource downloaded successfully!', 'success');
        }, 1000);
    }

    uploadResource() {
        sis.showToast('Resource upload feature would open here', 'info');
    }
}

// Initialize student dashboard

const studentDashboard = new StudentDashboard();
