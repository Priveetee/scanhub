package scanner

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"regexp"
	"strings"
	"syscall"
)

type Scanner struct {
	TrivyServerURL string
	RegistryURL    string
	GitlabToken    string
	GitlabURL      string
}

type ScanResult struct {
	Results []struct {
		Target          string         `json:"target"`
		Vulnerabilities []Vulnerability `json:"vulnerabilities"`
	} `json:"results"`
	Metadata struct {
		ImageSize string `json:"imageSize"`
		Layers    int    `json:"layers"`
	} `json:"metadata"`
}

type Vulnerability struct {
	VulnerabilityID  string `json:"vulnerabilityId"`
	PkgName          string `json:"packageName"`
	InstalledVersion string `json:"installedVersion"`
	FixedVersion     string `json:"fixedVersion"`
	Title            string `json:"title"`
	Description      string `json:"description"`
	Severity         string `json:"severity"`
}

func NewScanner(trivyURL, registryURL, gitlabToken string) *Scanner {
	return &Scanner{
		TrivyServerURL: trivyURL,
		RegistryURL:    registryURL,
	}
}

// Version améliorée de ScanImage qui supporte l'annulation via context
func (s *Scanner) ScanImageWithContext(ctx context.Context, imagePath string) (*ScanResult, error) {
	log.Printf("Starting scan for image with context: %s", imagePath)
	log.Printf("Using registry URL: %s", s.RegistryURL)
	
	// Set up environment variables
	env := os.Environ()
	env = append(env,
		fmt.Sprintf("GITLAB_TOKEN=%s", s.GitlabToken),
		"TRIVY_USERNAME=gitlab-ci-token",
		fmt.Sprintf("TRIVY_PASSWORD=%s", s.GitlabToken),
		"TRIVY_NON_SSL=true",
		"TRIVY_INSECURE=true",
		"TRIVY_DEBUG=true",
		fmt.Sprintf("HOME=%s", os.Getenv("HOME")),
	)
	
	args := []string{
		"image",
		"--server", s.TrivyServerURL,
		"--scanners", "vuln",
		"--severity", "CRITICAL,HIGH,MEDIUM,LOW",
		"--format", "json",
		"--quiet",
	}
	
	// Toujours ajouter les paramètres d'authentification pour le registry privé
	if strings.Contains(imagePath, s.RegistryURL) {
		log.Printf("Private registry image detected, adding authentication")
		args = append(args,
			"--username", "gitlab-ci-token",
			"--password", s.GitlabToken,
		)
	}
	
	args = append(args, imagePath)
	
	// Créer une commande avec le contexte
	cmd := exec.CommandContext(ctx, "trivy", args...)
	cmd.Env = env
	
	// Configurer un groupe de processus séparé pour pouvoir tuer tous les processus enfants
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	
	// Log command with redacted sensitive information
	log.Printf("Executing command with context: trivy %s", redactSensitiveArgs(args))
	
	output, err := cmd.CombinedOutput()
	
	// Vérifier si le contexte a été annulé
	if ctx.Err() != nil {
		log.Printf("Context canceled during scan of %s: %v", imagePath, ctx.Err())
		return nil, ctx.Err()
	}
	
	if err != nil {
		log.Printf("Error during scan: %v", err)
		log.Printf("Command output: %s", string(output))
		errMsg := extractErrorMessage(string(output))
		return nil, fmt.Errorf("scan error: %s", errMsg)
	}
	
	cleanOutput := cleanJSONOutput(string(output))
	var result ScanResult
	if err := json.Unmarshal([]byte(cleanOutput), &result); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		log.Printf("JSON to parse: %s", cleanOutput)
		return nil, fmt.Errorf("parse error: %v", err)
	}
	
	return &result, nil
}

// La méthode existante ScanImage utilise maintenant ScanImageWithContext avec un contexte de fond
func (s *Scanner) ScanImage(imagePath string) (*ScanResult, error) {
	return s.ScanImageWithContext(context.Background(), imagePath)
}

func redactSensitiveArgs(args []string) string {
	redactedArgs := make([]string, len(args))
	copy(redactedArgs, args)
	sensitiveFlags := map[string]bool{
		"--password": true,
	}
	for i := 0; i < len(redactedArgs)-1; i++ {
		if sensitiveFlags[redactedArgs[i]] {
			redactedArgs[i+1] = "[REDACTED]"
		}
	}
	return strings.Join(redactedArgs, " ")
}

func extractErrorMessage(output string) string {
	patterns := []string{
		`error:.+`,
		`failed.+`,
		`Error:.+`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		if match := re.FindString(output); match != "" {
			return match
		}
	}
	return output
}

func cleanJSONOutput(output string) string {
	start := strings.Index(output, "{")
	if start == -1 {
		return output
	}
	end := strings.LastIndex(output, "}")
	if end == -1 {
		return output
	}
	return output[start : end+1]
}
