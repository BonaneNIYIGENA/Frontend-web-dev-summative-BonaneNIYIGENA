// Validation functions
function validateEvent(event) {
    const errors = [];
    
    // Required field validation
    if (!event.title?.trim()) {
        errors.push('Event title is required');
    }
    
    if (!event.date) {
        errors.push('Event date is required');
    }
    
    if (!event.startTime) {
        errors.push('Start time is required');
    }
    
    if (!event.duration || event.duration <= 0) {
        errors.push('Duration must be a positive number');
    }
    
    if (!event.tag) {
        errors.push('Category is required');
    }
    
    // Date validation - advanced rule
    if (event.date && event.startTime) {
        const eventDateTime = new Date(event.date + 'T' + event.startTime);
        const now = new Date();
        
        if (eventDateTime < now) {
            errors.push('Event cannot be scheduled in the past');
        }
    }
    
    // Time format validation - advanced rule
    if (event.startTime && !isValidTimeFormat(event.startTime)) {
        errors.push('Start time must be in HH:MM format (24-hour)');
    }
    
    // Duration validation - advanced rule
    if (event.duration && (event.duration > 1440)) {
        errors.push('Duration cannot exceed 24 hours (1440 minutes)');
    }
    
    // Title length validation
    if (event.title && event.title.length > 100) {
        errors.push('Title cannot exceed 100 characters');
    }
    
    return errors;
}

function isValidTimeFormat(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

function validateDate(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
}

// Form validation with error display
function validateForm() {
    const formData = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        startTime: document.getElementById('eventStartTime').value,
        duration: parseInt(document.getElementById('eventDuration').value),
        tag: document.getElementById('eventCategory').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value
    };
    
    const errors = validateEvent(formData);
    displayFormErrors(errors);
    
    return errors.length === 0;
}

function displayFormErrors(errors) {
    const errorContainer = document.getElementById('formErrors');
    if (!errorContainer) return;
    
    errorContainer.innerHTML = '';
    
    if (errors.length > 0) {
        errorContainer.style.display = 'block';
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = error;
            errorContainer.appendChild(errorElement);
        });
    } else {
        errorContainer.style.display = 'none';
    }
}

function clearFormErrors() {
    const errorContainer = document.getElementById('formErrors');
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.innerHTML = '';
    }
}