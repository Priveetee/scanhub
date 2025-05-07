package models

// ScanRequest représente la structure d'une requête de scan
type ScanRequest struct {
	ImagePath string `json:"imagePath" binding:"required"`
	Registry  string `json:"registry" binding:"required"`
}

// ScanResponse représente la structure complète de la réponse
type ScanResponse struct {
	Success bool          `json:"success"`
	Data    *ScanData     `json:"data,omitempty"`
	Error   *ErrorDetails `json:"error,omitempty"`
}

// ScanData contient les données détaillées du scan
type ScanData struct {
	Target          string          `json:"target"`
	Metadata        ScanMetadata    `json:"metadata"`
	Summary         VulnSummary     `json:"summary"`
	Vulnerabilities []Vulnerability `json:"vulnerabilities"`
}

// ScanMetadata contient les métadonnées du scan
type ScanMetadata struct {
	ScanDuration float64 `json:"scanDuration"`
	ImageSize    string  `json:"imageSize"`
	Layers       int     `json:"layers"`
	ScanTime     string  `json:"scanTime"`
	Scanner      string  `json:"scanner"`
}

// VulnSummary fournit un résumé des vulnérabilités
type VulnSummary struct {
	Critical int `json:"critical"`
	High     int `json:"high"`
	Medium   int `json:"medium"`
	Low      int `json:"low"`
	Total    int `json:"total"`
}

// Vulnerability représente les détails d'une vulnérabilité
type Vulnerability struct {
	ID             string `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	Severity       string `json:"severity"`
	Package        string `json:"package"`
	Version        string `json:"version"`
	FixedVersion   string `json:"fixedVersion,omitempty"`
}

// ErrorDetails fournit des informations détaillées sur l'erreur
type ErrorDetails struct {
	Message    string `json:"message"`
	Code       string `json:"code"`
	Suggestion string `json:"suggestion,omitempty"`
}

// StatsResponse représente les statistiques d'utilisation
type StatsResponse struct {
	TotalScans   int64            `json:"totalScans"`
	LastScanTime string           `json:"lastScanTime"`
	ScansPerDay  []DailyScanCount `json:"scansPerDay"`
}

type DailyScanCount struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// StatsUpdate représente une mise à jour des stats
type StatsUpdate struct {
	ScanTime string `json:"scanTime"`
}