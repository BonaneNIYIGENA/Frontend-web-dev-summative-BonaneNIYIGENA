// State management - NO DATA HERE
let events = [];
let currentSort = { field: 'date', direction: 'asc' };
let currentSearch = '';
let currentCalendarWeek = 0;

function generateId() {
    return 'rec_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

/**
 * If no events in localStorage, load sample events from data/seeds.json
 */
function seedLocalStorageIfEmpty() {
    try {
        const raw = localStorage.getItem('events');
        if (raw && raw.length) return; // already seeded

        fetch('data/seeds.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch seeds.json: ' + res.status);
                return res.json();
            })
            .then(seedEvents => {
                if (Array.isArray(seedEvents) && seedEvents.length) {
                    localStorage.setItem('events', JSON.stringify(seedEvents));
                }
            })
            .catch(err => {
                console.warn('seedLocalStorageIfEmpty:', err);
            });
    } catch (err) {
        console.warn('seedLocalStorageIfEmpty:', err);
    }
}

// Ensure seeding runs during initialization
function init() {
    seedLocalStorageIfEmpty();
    // ...existing init logic...
}

// This function will be defined in storage.js
function saveEvents() {
    console.log('saveEvents called from state.js - should be overridden by storage.js');
}

console.log('State initialized - waiting for data from storage.js');