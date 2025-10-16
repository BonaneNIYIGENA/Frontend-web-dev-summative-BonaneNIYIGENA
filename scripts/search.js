// Search functionality
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