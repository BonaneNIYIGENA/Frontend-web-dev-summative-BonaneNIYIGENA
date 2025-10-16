# Campus Life Planner

A responsive web application built using vanilla HTML, CSS, and JavaScript to manage your campus life events and tasks. This app allows you to add, edit, delete, and track events/tasks with features like data persistence, regex search, and accessibility enhancements.

## Features

- **Responsive Layout**: Mobile-first design with breakpoints for tablet and desktop views.
- **Event Management**: Add, edit, and delete campus life events/tasks (e.g., classes, study sessions, extracurriculars).
- **Real-time Search**: Regex-powered live search for filtering events/tasks by title, date, and tags.
- **Data Persistence**: Local storage for saving events across sessions. Import and export data in JSON format.
- **Sorting**: Sort events by date, title, or duration.
- **Accessibility (a11y)**: Fully keyboard-navigable with ARIA live regions and proper contrast.
- **Stats Dashboard**: Overview of total records, top tags, and simple trends.

## Technologies

- **HTML5**: Semantic structure and accessibility best practices.
- **CSS3**: Flexbox-based responsive design with media queries.
- **JavaScript**: DOM manipulation, event handling, regex validation, and persistence with localStorage.
- **Regex**: Complex pattern matching for data validation and search.

## Setup & Installation

To run the app locally:

1. Clone the repository:
    ```bash
    git clone https://github.com/BonaneNIYIGENA/Frontend-web-dev-summative-BonaneNIYIGENA.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Frontend-web-dev-summative-BonaneNIYIGENA
    ```
3. Open the `index.html` file in your browser.

## Features List

1. **Event Record Fields**:
   - `title`: Title of the event/task.
   - `dueDate`: Due date (YYYY-MM-DD format).
   - `duration`: Duration in hours (numeric).
   - `tag`: Category or label for the event/task (e.g., "Study", "Work", etc.).
   - `createdAt` and `updatedAt`: Timestamps for record creation and last update.

2. **Core Features**:
   - Add, edit, delete, and search for events.
   - Data saved and loaded from `localStorage`.
   - Import/export events in JSON format.
   - Sorting events by due date, title, or duration.
   - Live search with regex support.
   - Stats overview with simple trend analysis.

## Regex Catalog

- **Title/Description Validation**: `^\S(?:.*\S)?$` (No leading/trailing spaces, no multiple spaces).
- **Duration Validation**: `^(0|[1-9]\d*)(\.\d{1,2})?$` (Numeric value with optional two-decimal precision).
- **Date Validation**: `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` (Date in `YYYY-MM-DD` format).
- **Tag Validation**: `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` (Letters, spaces, and hyphens).
- **Duplicate Word Check**: `\b(\w+)\s+\1\b` (Check for consecutive repeated words).
- **Time Validation**: `\b\d{2}:\d{2}\b` (Time format, e.g., "14:30").

## Keyboard Map

- **Tab**: Navigate through form fields and buttons.
- **Enter**: Submit form or trigger actions.
- **Arrow keys**: Navigate through event records (sorting, search).
- **Escape**: Close modals or exit editing mode.

## Accessibility Notes

- **Keyboard Navigation**: Full support for keyboard navigation, including tabbing through fields, and buttons.
- **ARIA Live Regions**: Used for announcing status changes, like successful form submission or validation errors.
- **Contrast**: Text and background colors meet WCAG accessibility standards for contrast.

## Testing

To run tests for form validation and sorting, open the `tests.html` file in your browser. The tests include:

- **Form Validation**: Tests for correct input (title, duration, date, and tag).
- **Regex Search**: Tests for regex-based search patterns.
- **Sorting**: Ensures correct sorting by date, title, and duration.

## Import/Export Data

- **Import JSON**: You can import event data using the "Import" option in settings. The data structure must be validated before loading.
- **Export JSON**: Export your current events to a JSON file for backup or transfer.

## Demo Video

[Link to Demo Video](https://www.youtube.com/your-video-link)

In the demo video, I showcase:
- User Interface from ideation of the design to the final design
- Regex search with edge cases.
- Import/export functionality.
- Responsive design across multiple devices.

## Deployment
The app is deployed and accessible via GitHub Pages.
**GitHub Pages URL**: [https://your-username.github.io/campus-life-planner](https://your-username.github.io/campus-life-planner)

**GitHub Repo**: [https://github.com/your-username/campus-life-planner](https://github.com/your-username/campus-life-planner)

For any inquiries or suggestions, you can reach me via [email@example.com](mailto:email@b.niyigena@alustudent.com).
