package config

import (
	"log"
	"os"
	"strconv"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	TrivyServerURL string
	RegistryURL    string
	GitlabToken    string
	GitlabURL      string
	NonSSL         bool
	Insecure       bool
	Debug          bool
	Environment    string
}

var (
	cfg  *Config
	once sync.Once
)

func Get() *Config {
	once.Do(func() {
		if os.Getenv("ENV") != "production" {
			err := godotenv.Load()
			if err != nil {
				log.Printf("failed to load .env file: %v", err)
			}
		}

		nonSSL, err := strconv.ParseBool(os.Getenv("TRIVY_NON_SSL"))
		if err != nil {
			log.Printf("failed to parse TRIVY_NON_SSL: %v, defaulting to false", err)
			nonSSL = false
		}

		insecure, err := strconv.ParseBool(os.Getenv("TRIVY_INSECURE"))
		if err != nil {
			log.Printf("failed to parse TRIVY_INSECURE: %v, defaulting to false", err)
			insecure = false
		}

		debug, err := strconv.ParseBool(os.Getenv("TRIVY_DEBUG"))
		if err != nil {
			log.Printf("failed to parse TRIVY_DEBUG: %v, defaulting to false", err)
			debug = false
		}

		env := os.Getenv("ENV")
		if env == "" || env == "production" {
			env = "release"
		} else if env == "development" {
			env = "debug"
		}

		cfg = &Config{
			TrivyServerURL: os.Getenv("TRIVY_SERVER_URL"),
			NonSSL:         nonSSL,
			Insecure:       insecure,
			Debug:          debug,
			Environment:    env,
		}
	})

	return cfg
}
