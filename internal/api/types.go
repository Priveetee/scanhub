package api

// Structure de la requête
type ScanRequest struct {
    ImagePath string `json:"imagePath" binding:"required"`
    Registry  string `json:"registry" binding:"required"`
}

// Structure complète de la réponse
type ScanResponse struct {
    Success bool           `json:"success"`
    Data    *ScanData     `json:"data,omitempty"`
    Error   *ErrorDetails `json:"error,omitempty"`
}

// Structure détaillée des données de scan
type ScanData struct {
	Target          string           `json:"target"`
	Metadata        ScanMetadata     `json:"metadata"`
	Summary         VulnSummary      `json:"summary"`
	Vulnerabilities []Vulnerability  `json:"vulnerabilities"`
}


// Métadonnées du scan
type ScanMetadata struct {
    ScanDuration float64 `json:"scanDuration"`
    ImageSize    string  `json:"imageSize"`
    Layers       int     `json:"layers"`
    ScanTime     string  `json:"scanTime"`
    Scanner      string  `json:"scanner"`
}

// Résumé des vulnérabilités
type VulnSummary struct {
    Critical int `json:"critical"`
    High     int `json:"high"`
    Medium   int `json:"medium"`
    Low      int `json:"low"`
    Total    int `json:"total"`
}

// Structure détaillée d'une vulnérabilité
type Vulnerability struct {
    ID               string   `json:"id"`
    Title            string   `json:"title"`
    Description      string   `json:"description"`
    Severity         string   `json:"severity"`
    Package          string   `json:"package"`
    Version          string   `json:"version"`
    FixedVersion     string   `json:"fixedVersion,omitempty"`
    References      string `json:"references,omitempty"`
    PublishedDate    string   `json:"publishedDate,omitempty"`
    LastModifiedDate string   `json:"lastModifiedDate,omitempty"`
}

// Détails d'erreur enrichis
type ErrorDetails struct {
    Message    string `json:"message"`
    Code       string `json:"code"`
    Suggestion string `json:"suggestion,omitempty"`
}