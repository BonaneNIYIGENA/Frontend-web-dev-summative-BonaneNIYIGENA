// Storage management - Handles data between seeds.json and localStorage
function loadSettings() {
    // Load events from localStorage or initialize from seeds.json
    loadEvents();
}

// Load events from localStorage, initialize from seeds.json if empty
function loadEvents() {
    console.log('Loading events...');
    
    // Try to load from localStorage first
    const storedEvents = localStorage.getItem('userEvents');
    
    if (storedEvents) {
        // Load existing user data from localStorage
        events = JSON.parse(storedEvents);
        console.log('Loaded', events.length, 'events from localStorage');
    } else {
        // First time user - initialize from seeds.json default data
        initializeFromSeeds();
    }
    
    // Update UI
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof renderEvents === 'function') renderEvents();
}

// Initialize with default data from seeds.json
function initializeFromSeeds() {
    console.log('Initializing with default data from seeds.json...');
    
    // This would be the default data from seeds.json
    const defaultData = {
    "events": [
        {
            "id": "rec_sample_1",
            "title": "FrontEnd Web Development",
            "date": "2025-10-15",
            "startTime": "14:00",
            "duration": 90,
            "location": "Ethiopia",
            "tag": "Academics",
            "description": "Weekly class session with Facilitator David",
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
        },
        {
            "id": "rec_sample_2",
            "title": "Basketball Tournament Finals",
            "date": "2025-10-15",
            "startTime": "16:00",
            "duration": 120,
            "location": "ALU Bascktball Court",
            "tag": "Games&Fun",
            "description": "Championship finals of the inter-college basketball tournament",
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
        },
        {
            "id": "rec_sample_3",
            "title": "Robotics Club",
            "date": "2025-10-17",
            "startTime": "13:00",
            "duration": 360,
            "location": "Robotics Club Lab",
            "tag": "Extracalcular",
            "description": "Showcase of student-built robots and AI projects",
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
        },
        {
            "id": "rec_sample_4",
            "title": "Industry Mentorship Program",
            "date": "2025-10-17",
            "startTime": "09:00",
            "duration": 120,
            "location": "Leadership Center",
            "tag": "Mission Curation Programs",
            "description": "Connect with industry professionals for career guidance",
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
        },
        {
            "id": "rec_sample_5",
            "title": "Yoga and Meditation Session",
            "date": "2025-10-15",
            "startTime": "07:00",
            "duration": 60,
            "location": "Kenya-Burundi",
            "tag": "Wellness activites",
            "description": "Morning yoga session for stress relief and mental clarity",
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
        }
    ],
    "version": "1.0",
    "createdAt": new Date().toISOString()
};
    
    events = defaultData.events;
    saveToLocalStorage();
    console.log('Initialized with', events.length, 'default events from seeds.json');
}

// Save events to localStorage
function saveToLocalStorage() {
    localStorage.setItem('userEvents', JSON.stringify(events));
    console.log('Saved', events.length, 'events to localStorage');
}

/**
 * Save event handler for the form in index.html
 * Called from: <form onsubmit="return saveEvent(event)">
 */
function saveEvent(e) {
    e.preventDefault();

    const formErrors = document.getElementById('formErrors');
    formErrors.innerText = '';

    const editId = document.getElementById('editId').value || '';
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const startTime = document.getElementById('eventStartTime').value;
    const duration = parseInt(document.getElementById('eventDuration').value, 10);
    const location = document.getElementById('eventLocation').value.trim();
    const category = document.getElementById('eventCategory').value;
    const description = document.getElementById('eventDescription').value.trim();

    // Basic validation
    if (!title || !date || !startTime || !Number.isFinite(duration) || duration <= 0 || !category) {
        formErrors.innerText = 'Please complete all required fields (title, date, start time, duration, category).';
        return false;
    }

    // Build event object
    const startsAt = new Date(date + 'T' + startTime);
    if (isNaN(startsAt.getTime())) {
        formErrors.innerText = 'Invalid date or time.';
        return false;
    }
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);

    const eventObj = {
        id: editId || Date.now().toString(),
        title,
        date, // keeping original date for displays
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        duration: duration,
        location,
        category,
        description,
        updatedAt: new Date().toISOString()
    };

    // Load existing events
    const raw = localStorage.getItem('events');
    const events = raw ? JSON.parse(raw) : [];

    if (editId) {
        // update existing
        const idx = events.findIndex(ev => ev.id === editId);
        if (idx !== -1) events[idx] = Object.assign({}, events[idx], eventObj);
        else events.push(eventObj);
    } else {
        // add new
        events.push(eventObj);
    }

    // persist
    localStorage.setItem('events', JSON.stringify(events));

    // Reset form and navigate back to events view
    document.getElementById('eventForm').reset();
    document.getElementById('editId').value = '';
    if (typeof showSection === 'function') showSection('events');
    if (typeof init === 'function') init(); // refresh UI if available

    return false;
}

// Export current data as seeds.json file (for backup)
function exportToSeedsJSON() {
    const seedsData = {
        events: events,
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalEvents: events.length,
        source: "localStorage"
    };
    
    const dataStr = JSON.stringify(seedsData, null, 2);
    downloadFile(dataStr, 'my-events.json', 'application/json');
    showNotification('Events exported to JSON successfully!', 'success');
}

// Import from JSON file and replace localStorage data
function importFromSeedsJSON() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!importedData.events || !Array.isArray(importedData.events)) {
                    throw new Error('Invalid file format: events array not found');
                }
                
                if (confirm(`Import ${importedData.events.length} events? This will replace all current events.`)) {
                    events = importedData.events;
                    saveToLocalStorage();
                    renderEvents();
                    showNotification('Events imported successfully!', 'success');
                }
            } catch (error) {
                showNotification('Error importing file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

// Reset to default seeds.json data
function resetToDefault() {
    if (confirm('Reset to default sample data? This will replace all your current events.')) {
        localStorage.removeItem('userEvents'); // Clear user data
        initializeFromSeeds(); // Reload from seeds.json default
        showNotification('Reset to default data successfully!', 'success');
    }
}

function clearAllData() {
    if (events.length === 0) {
        alert('No events to clear.');
        return;
    }
    
    if (confirm('Would you like to export your data as backup before clearing?')) {
        exportToSeedsJSON();
    }
    
    if (confirm('Are you absolutely sure? This will permanently delete all event data!')) {
        events = [];
        saveToLocalStorage();
        renderEvents();
        updateDashboard();
        showNotification('All events cleared!', 'success');
    }
}

function exportToJSON() {
    const data = {
        events: events,
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalEvents: events.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    downloadFile(dataStr, 'campus-events.json', 'application/json');
    showNotification('Events exported to JSON successfully!', 'success');
}

function exportToCSV() {
    const headers = ['Title', 'Date', 'Start Time', 'Duration', 'Location', 'Category', 'Description'];
    const csvData = events.map(event => [
        `"${event.title}"`,
        event.date,
        event.startTime,
        event.duration,
        `"${event.location || ''}"`,
        event.tag,
        `"${event.description || ''}"`
    ]);
    
    const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');
    
    downloadFile(csvContent, 'campus-events.csv', 'text/csv');
    showNotification('Events exported to CSV successfully!', 'success');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importFromJSON() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!importedData.events || !Array.isArray(importedData.events)) {
                    throw new Error('Invalid file format: events array not found');
                }
                
                const validEvents = importedData.events.filter(event => 
                    event.title && event.date && event.startTime && event.duration && event.tag
                );
                
                if (validEvents.length === 0) {
                    throw new Error('No valid events found in the file');
                }
                
                if (confirm(`Import ${validEvents.length} events? This will replace your current events.`)) {
                    events = validEvents;
                    saveToLocalStorage();
                    renderEvents();
                    showNotification('Events imported successfully!', 'success');
                }
            } catch (error) {
                showNotification('Error importing file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}