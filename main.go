package main

import (
	"embed"
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create log file
	logPath := getLogFilePath()
	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Printf("Failed to open log file: %v", err)
	} else {
		defer logFile.Close()
		log.SetOutput(logFile)
		log.Printf("Starting application, logs will be written to: %s", logPath)
	}

	// Create application instance
	app := NewApp()

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "Garden Product Manager",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 46, G: 125, B: 50, A: 1},
		OnStartup:        app.startup,
		OnShutdown:       app.shutdown,
		Bind: []interface{}{
			app,
		},
		// Set log level to only show errors, suppressing trace logs
		LogLevel:           logger.ERROR,
		LogLevelProduction: logger.ERROR,
	})

	if err != nil {
		log.Fatalf("Error starting application: %v", err)
	}
}

// getLogFilePath returns the platform-specific log file path
func getLogFilePath() string {
	var appDataDir string

	switch runtime.GOOS {
	case "windows":
		// For Windows - use %APPDATA%
		appDataDir = os.Getenv("APPDATA")
		if appDataDir == "" {
			// Fallback if %APPDATA% is not available
			appDataDir = filepath.Join(os.Getenv("USERPROFILE"), "AppData", "Roaming")
		}
	case "darwin":
		// For macOS - use ~/Library/Application Support
		appDataDir = filepath.Join(os.Getenv("HOME"), "Library", "Application Support")
	default:
		// For Linux and others - use ~/.local/share
		appDataDir = filepath.Join(os.Getenv("HOME"), ".local", "share")
	}

	// Create application-specific folder
	logDir := filepath.Join(appDataDir, "GardenProductManager", "logs")
	os.MkdirAll(logDir, 0755)

	return filepath.Join(logDir, "app.log")
}
