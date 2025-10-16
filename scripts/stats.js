// Statistics and dashboard functions
function updateDashboard() {
    const totalEvents = events.length;
    
    // Count unique rooms/locations for today
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter(e => e.date === today);
    const uniqueRooms = new Set(todayEvents.map(e => e.location || 'TBA')).size;
    
    const categoryCount = {};
    events.forEach(e => {
        categoryCount[e.tag] = (categoryCount[e.tag] || 0) + 1;
    });
    
    const topCat = Object.keys(categoryCount).length > 0 
        ? Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b) 
        : 'N/A';
    
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= now && eventDate <= nextWeek;
    }).length;
    
    document.getElementById('totalEvents').textContent = totalEvents;
    document.getElementById('totalHours').textContent = uniqueRooms;
    document.getElementById('topCategory').textContent = topCat;
    document.getElementById('weekEvents').textContent = weekEvents;
    
    // Update card label
    const roomLabel = document.querySelector('#totalHours + .stat-label');
    if (roomLabel) {
        roomLabel.textContent = 'Rooms used today';
    }
    
    updateTrendChart();
    
    console.log('Dashboard updated:', {
        totalEvents,
        uniqueRooms,
        topCat,
        weekEvents
    });
}

function updateTrendChart() {
    const chart = document.getElementById('trendChart');
    const trendInfo = document.getElementById('trendInfo');
    if (!chart) return;
    
    chart.innerHTML = '';
    
    // Get next 7 days starting from Monday of current week
    const days = [];
    const now = new Date();
    
    // Find Monday of current week
    const monday = new Date(now);
    const dayOfWeek = monday.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    monday.setDate(monday.getDate() + diffToMonday);
    
    // Generate Monday to Sunday
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        days.push(date.toISOString().split('T')[0]);
    }
    
    // Count events for each day
    const dayCounts = days.map(day => {
        return events.filter(e => e.date === day).length;
    });
    
    const maxCount = Math.max(...dayCounts, 1);
    const busiestDayIndex = dayCounts.indexOf(maxCount);
    const busiestDay = new Date(days[busiestDayIndex]);
    
    // Update trend info
    if (maxCount > 0) {
        trendInfo.textContent = `Busiest day: ${busiestDay.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} with ${maxCount} event${maxCount > 1 ? 's' : ''}`;
    } else {
        trendInfo.textContent = 'No events scheduled for this week';
    }
    
    // Create bars in Monday to Sunday order
    days.forEach((day, i) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (dayCounts[i] / maxCount) * 100;
        bar.style.height = height + '%';
        
        const label = document.createElement('span');
        label.className = 'bar-label';
        const date = new Date(day);
        label.textContent = date.toLocaleDateString('en', { weekday: 'short' });
        
        const value = document.createElement('span');
        value.className = 'bar-value';
        value.textContent = dayCounts[i];
        
        bar.appendChild(value);
        bar.appendChild(label);
        chart.appendChild(bar);
    });
    
    console.log('Chart data:', { days, dayCounts, maxCount });
}