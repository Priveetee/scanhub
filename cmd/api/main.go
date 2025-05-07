package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"scanner-api/internal/api"
	"scanner-api/internal/config"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Printf("failed to load .env file: %v", err)
	}

	// Get configuration
	cfg := config.Get()

	// Set Gin mode
	gin.SetMode(cfg.Environment)

	// Create Gin router
	r := gin.Default()

	// Apply middlewares
	r.Use(api.CORSMiddleware())
	r.Use(api.TimeoutMiddleware(120 * time.Second))

	// Define routes
	r.GET("/health", api.HealthCheck)
	r.POST("/scan", api.ScanImage)
	r.GET("/stats", api.GetStats)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "12823"
	}
}
