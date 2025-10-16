// UI management
function init() {
    console.log('Initializing application...');
    loadSettings();
    setupSearch();
    setupSorting();
    setupTheme();
    
    // Set default date to today for the form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
    
    // Initialize all displays
    updateDashboard();
    renderEvents();
    
    console.log('Application initialized with', events.length, 'events from seeds.json');
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark-theme');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark-theme');
        root.setAttribute('data-theme', 'light');
    }

    // Only show small icon (no text) on toggle buttons
    const sunIcon = '<i class="fas fa-sun" aria-hidden="true"></i>';
    const moonIcon = '<i class="fas fa-moon" aria-hidden="true"></i>';

    const updateBtn = (btn) => {
        if (!btn) return;
        // Show the icon that indicates the action (sun = switch to light, moon = switch to dark)
        if (theme === 'dark') {
            btn.innerHTML = sunIcon;
            btn.setAttribute('aria-label', 'Switch to light theme');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.innerHTML = moonIcon;
            btn.setAttribute('aria-label', 'Switch to dark theme');
            btn.setAttribute('aria-pressed', 'false');
        }
        // mark for CSS sizing
        btn.classList.add('icon-only');
    };
    updateBtn(document.getElementById('sidebarThemeToggle'));
    updateBtn(document.getElementById('themeToggle'));
}

function toggleTheme() {
    try {
        const current = localStorage.getItem('theme') || (document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    } catch (err) {
        console.warn('toggleTheme:', err);
    }
}

// Apply saved theme on script load (runs before DOMContentLoaded; update buttons once DOM ready)
(function() {
    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);
    // If DOM isn't ready we still attempt to update buttons after DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyTheme(localStorage.getItem('theme') || saved));
    }
})();

function updateThemeButton(theme) {
    // Keep this in sync with applyTheme's icon-only behavior
    const btnIds = ['sidebarThemeToggle', 'themeToggle'];
    const sunIcon = '<i class="fas fa-sun" aria-hidden="true"></i>';
    const moonIcon = '<i class="fas fa-moon" aria-hidden="true"></i>';
    btnIds.forEach(id => {
        const button = document.getElementById(id);
        if (!button) return;
        if (theme === 'dark') {
            button.innerHTML = sunIcon;
            button.setAttribute('aria-label', 'Switch to light theme');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.innerHTML = moonIcon;
            button.setAttribute('aria-label', 'Switch to dark theme');
            button.setAttribute('aria-pressed', 'false');
        }
        button.classList.add('icon-only');
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Find and activate nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.textContent.includes(getNavText(sectionId))) {
            item.classList.add('active');
        }
    });
    
    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
    
    // Special handlers
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'calendar') {
        renderCalendar();
    }
}

function getNavText(sectionId) {
    const map = {
        'dashboard': 'Dashboard',
        'events': 'Events',
        'calendar': 'Calendar View',
        'form': 'Add Event',
        'settings': 'Settings',
        'about': 'About'
    };
    return map[sectionId] || '';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Enhanced sorting functionality with dropdown
function setupSorting() {
    const sortSelect = document.getElementById('sortSelect');
    const sortDirection = document.getElementById('sortDirection');
    
    if (sortSelect) {
        sortSelect.value = currentSort.field;
        sortSelect.addEventListener('change', function(e) {
            currentSort.field = e.target.value;
            renderEvents();
        });
    }
    
    if (sortDirection) {
        updateSortDirectionButton();
        sortDirection.addEventListener('click', function() {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            updateSortDirectionButton();
            renderEvents();
        });
    }
}

function updateSortDirectionButton() {
    const sortDirection = document.getElementById('sortDirection');
    if (sortDirection) {
        if (currentSort.direction === 'asc') {
            sortDirection.innerHTML = '<i class="fas fa-sort-amount-up"></i> Ascending';
        } else {
            sortDirection.innerHTML = '<i class="fas fa-sort-amount-down"></i> Descending';
        }
    }
}

function getSortDisplayName(field) {
    const names = {
        'date': 'Date',
        'title': 'Title',
        'tag': 'Category',
        'duration': 'Duration',
        'location': 'Location'
    };
    return names[field] || field;
}

/**
 * Map category text to a CSS badge class.
 * Normalizes common typos/variants used in your data.
 */
function mapCategoryToClass(cat) {
    const raw = String(cat || '').toLowerCase().trim();
    const key = raw.replace(/\s+/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

    switch (key) {
        case 'academics':
            return 'badge-academics';
        case 'wellnessactivites': case 'wellnessactivities': case 'wellnessactivitiy':
            return 'badge-wellness';
        case 'gamesandfun': case 'gamesfun': case 'games':
            return 'badge-games';
        case 'missioncurationprograms': case 'missioncuration': case 'missioncurationprogram':
            return 'badge-mission';
        case 'extracalcular': case 'extracurricular': case 'extracurriculars':
            return 'badge-extracurricular';
        default:
            return 'badge-default';
    }
}

function renderEvents() {
    const tbody = document.getElementById('eventsTableBody');
    const cards = document.getElementById('eventsCards');
    if (!tbody || !cards) return;
    
    console.log('Rendering events. Total events:', events.length);
    console.log('Current sort:', currentSort);
    
    tbody.innerHTML = '';
    cards.innerHTML = '';
    
    // Get filtered events with regex search
    let displayEvents = currentSearch ? searchEventsWithRegex(currentSearch) : [...events];
    
    console.log('Events to display:', displayEvents.length);
    
    // Sort events based on current selection
    displayEvents.sort((a, b) => {
        let aVal = a[currentSort.field];
        let bVal = b[currentSort.field];
        
        if (currentSort.field === 'date') {
            aVal = new Date(a.date + 'T' + a.startTime);
            bVal = new Date(b.date + 'T' + b.startTime);
        } else if (currentSort.field === 'duration') {
            aVal = parseInt(aVal);
            bVal = parseInt(bVal);
        } else if (currentSort.field === 'title' || currentSort.field === 'description' || currentSort.field === 'location') {
            aVal = aVal?.toString().toLowerCase() || '';
            bVal = bVal?.toString().toLowerCase() || '';
        } else {
            aVal = aVal?.toString().toLowerCase() || '';
            bVal = bVal?.toString().toLowerCase() || '';
        }
        
        if (currentSort.direction === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
    
    // Render events
    displayEvents.forEach((event) => {
        const eventDateTime = new Date(event.date + 'T' + event.startTime);
        const endTime = getEndTime(event.startTime, event.duration);
        
        // Table row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${highlightMatches(event.title, currentSearch)}</td>
            <td>
                <div class="event-date">${eventDateTime.toLocaleDateString()}</div>
                <div class="event-time">${event.startTime} - ${endTime}</div>
            </td>
            <td><span class="badge badge-${event.tag.toLowerCase()}">${event.tag}</span></td>
            <td class="duration-cell">${event.duration} min</td>
            <td>${highlightMatches(event.location || 'TBA', currentSearch)}</td>
            <td class="actions-cell">
                <button class="btn btn-secondary btn-sm" onclick="editEvent('${event.id}')" aria-label="Edit event">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event.id}')" aria-label="Delete event">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Card view
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-card-title">${highlightMatches(event.title, currentSearch)}</div>
            <div class="event-card-info">
                <span class="badge badge-${event.tag.toLowerCase()}">${event.tag}</span>
                <span class="event-date">${eventDateTime.toLocaleDateString()}</span>
                <span class="event-time">${event.startTime}-${endTime}</span>
                <span class="event-duration">${event.duration} min</span>
                <span class="event-location">${highlightMatches(event.location || 'TBA', currentSearch)}</span>
            </div>
            ${event.description ? `<div class="event-card-description">${highlightMatches(event.description, currentSearch)}</div>` : ''}
            <div class="event-card-actions">
                <button class="btn btn-secondary" onclick="editEvent('${event.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteEvent('${event.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        cards.appendChild(card);
    });
    
    // Update current sort display
    updateCurrentSortDisplay();
    
    // Show/hide table vs cards based on screen size
    const table = document.getElementById('eventsTable');
    if (table && window.innerWidth <= 768) {
        table.style.display = 'none';
        cards.style.display = 'block';
    } else if (table) {
        table.style.display = 'table';
        cards.style.display = 'none';
    }
}

function updateCurrentSortDisplay() {
    const currentSortDisplay = document.getElementById('currentSortDisplay');
    if (currentSortDisplay) {
        const fieldName = getSortDisplayName(currentSort.field);
        const direction = currentSort.direction === 'asc' ? 'Ascending' : 'Descending';
        currentSortDisplay.textContent = `Sorted by: ${fieldName} (${direction})`;
    }
}

// Enhanced regex search functionality
function searchEventsWithRegex(query) {
    if (!query) return events;
    
    try {
        // Try to compile as regex with case-insensitive flag
        const regex = new RegExp(query, 'i');
        
        return events.filter(event => {
            return regex.test(event.title) ||
                   regex.test(event.description || '') ||
                   regex.test(event.location || '') ||
                   regex.test(event.tag);
        });
    } catch (error) {
        // If regex fails, fall back to simple string search
        console.warn('Invalid regex pattern, falling back to simple search:', error);
        const lowerQuery = query.toLowerCase();
        
        return events.filter(event => {
            return event.title.toLowerCase().includes(lowerQuery) ||
                   (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
                   event.location.toLowerCase().includes(lowerQuery) ||
                   event.tag.toLowerCase().includes(lowerQuery);
        });
    }
}

function highlightMatches(text, query) {
    if (!query || !text) return text;
    
    try {
        const regex = new RegExp(query, 'gi');
        return text.replace(regex, match => `<mark>${match}</mark>`);
    } catch (error) {
        // Fallback to simple string replacement
        const lowerQuery = query.toLowerCase();
        const lowerText = text.toLowerCase();
        let result = '';
        let lastIndex = 0;
        
        for (let i = 0; i < text.length; i++) {
            if (lowerText.substr(i, lowerQuery.length) === lowerQuery) {
                result += text.substring(lastIndex, i) + `<mark>${text.substr(i, lowerQuery.length)}</mark>`;
                i += lowerQuery.length - 1;
                lastIndex = i + 1;
            }
        }
        
        result += text.substring(lastIndex);
        return result || text;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentSearch = e.target.value;
            renderEvents();
            
            // Show regex validation
            const searchContainer = searchInput.parentElement;
            let validationMsg = searchContainer.querySelector('.regex-validation');
            
            if (!validationMsg) {
                validationMsg = document.createElement('div');
                validationMsg.className = 'regex-validation';
                searchContainer.appendChild(validationMsg);
            }
            
            if (currentSearch) {
                try {
                    new RegExp(currentSearch, 'i');
                    validationMsg.textContent = '✓ Valid regex pattern';
                    validationMsg.className = 'regex-validation valid';
                } catch (error) {
                    validationMsg.textContent = '⚠ Using simple search (invalid regex)';
                    validationMsg.className = 'regex-validation invalid';
                }
            } else {
                validationMsg.textContent = '';
            }
        });
    }
}

function showSuccessMessage(message = "Event added successfully!") {
    showNotification(message, 'success');
}

function saveEvent(e) {
    if (e) e.preventDefault();
    
    console.log('=== SAVE EVENT START ===');
    
    // Clear previous errors
    clearFormErrors();
    
    // Get form values
    const eventData = {
        title: document.getElementById('eventTitle').value.trim(),
        date: document.getElementById('eventDate').value,
        startTime: document.getElementById('eventStartTime').value,
        duration: parseInt(document.getElementById('eventDuration').value),
        location: document.getElementById('eventLocation').value.trim(),
        tag: document.getElementById('eventCategory').value,
        description: document.getElementById('eventDescription').value.trim()
    };
    
    const editId = document.getElementById('editId').value;
    
    console.log('Form data:', eventData);
    console.log('Edit ID:', editId);
    
    // Validate form
    if (!validateForm()) {
        return false;
    }
    
    // Generate ID for new events
    if (!editId) {
        eventData.id = generateId();
        eventData.createdAt = new Date().toISOString();
        events.push(eventData);
        console.log('Added new event. ID:', eventData.id);
    } else {
        // Update existing event
        const eventIndex = events.findIndex(e => e.id === editId);
        if (eventIndex !== -1) {
            eventData.id = editId;
            eventData.createdAt = events[eventIndex].createdAt;
            events[eventIndex] = eventData;
            console.log('Updated existing event at index:', eventIndex);
        }
    }
    
    eventData.updatedAt = new Date().toISOString();
    
    console.log('Events after save:', events.length);
    
    // Save to storage
    saveEvents();
    
    // Update UI
    renderEvents();
    updateDashboard();
    
    // Show success message
    showNotification(`Event "${eventData.title}" ${editId ? 'updated' : 'added'} successfully!`, 'success');
    
    // Reset form
    document.getElementById('eventForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Event';
    
    // Set default date to today
    document.getElementById('eventDate').value = today;
    
    // Go back to events section
    showSection('events');
    
    console.log('=== SAVE EVENT END ===');
    return false;
}

function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('formTitle').textContent = 'Edit Event';
    document.getElementById('editId').value = eventId;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventStartTime').value = event.startTime;
    document.getElementById('eventDuration').value = event.duration;
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventCategory').value = event.tag;
    document.getElementById('eventDescription').value = event.description || '';
    
    showSection('form');
}

function deleteEvent(eventId) {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    const eventName = events[eventIndex].title;
    if (confirm(`Are you sure you want to delete "${eventName}"?`)) {
        events.splice(eventIndex, 1);
        saveEvents();
        renderEvents();
        updateDashboard();
        showNotification(`Event "${eventName}" deleted successfully!`, 'success');
    }
}

// Utility function to calculate end time
function getEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}