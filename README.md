# Modern Wails Application

## About

This is a modern desktop application built with Wails, React, TypeScript, and Chakra UI. It features a responsive and accessible UI with both light and dark mode support.

### Features
- Greeter functionality
- Real-time calculator with basic math operations
- Live clock display
- Dark/Light mode toggle
- Modern, responsive UI with Chakra UI components

## Prerequisites

Ensure you have the following installed:
- Go 1.18 or later
- Node.js 14 or later
- Wails CLI (install with `go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

## Development

To run in live development mode:

```bash
cd wails-app
wails dev
```

This will run a Vite development server that provides fast hot reload of frontend changes. You can also access the Go methods through the dev server at http://localhost:34115.

## Building

To build a redistributable, production-mode package:

```bash
cd wails-app
wails build
```

This will create an executable for your platform in the `build/bin` directory.

## Technologies Used

- **Backend**: Go
- **Frontend**: React, TypeScript
- **UI Framework**: Chakra UI
- **Desktop Framework**: Wails

## Project Structure

- `/frontend` - React frontend code
- `/frontend/src` - React components and assets
- `/wailsjs` - Auto-generated bindings between Go and JavaScript
- `app.go` - Main application logic
- `main.go` - Entry point for the application
