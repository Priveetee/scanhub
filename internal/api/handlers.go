package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
	"scanner-api/internal/config"
	"scanner-api/internal/models"
	"scanner-api/internal/scanner"
)

const (
	statsFile = "scanner_stats.json"
)

// Structure pour stocker les statistiques persistantes
type persistentStats struct {
	TotalScans   int64           `json:"totalScans"`
	LastScanTime string          `json:"lastScanTime"`
	DailyScans   map[string]int  `json:"dailyScans"`
}

var (
	// Remplacer la structure simple par des compteurs atomiques pour les mises à jour fréquentes
	atomicTotalScans int64
	lastScanTime     atomic.Value // Pour stocker de manière thread-safe

	// Cache pour les statistiques quotidiennes avec un TTL de 5 minutes
	dailyStatsCache = cache.New(5*time.Minute, 10*time.Minute)

	// Mutex plus léger utilisé seulement pour les mises à jour de la map
	dailyScans     = make(map[string]int)
	dailyScanMutex sync.Mutex
	
	// Mutex pour la sauvegarde/lecture du fichier
	statsPersistMutex sync.Mutex
)

func init() {
	// Initialiser lastScanTime avec une valeur par défaut
	lastScanTime.Store("")
	
	// Charger les statistiques depuis le fichier
	err := loadStats()
	if err != nil {
		log.Printf("Impossible de charger les statistiques: %v", err)
		log.Printf("Démarrage avec des statistiques vides")
	} else {
		log.Printf("Statistiques chargées avec succès: totalScans=%d, jours=%d", 
				  atomicTotalScans, len(dailyScans))
	}
}

// Charger les statistiques depuis le fichier
func loadStats() error {
	statsPersistMutex.Lock()
	defer statsPersistMutex.Unlock()
	
	// Vérifier si le fichier existe
	if _, err := os.Stat(statsFile); os.IsNotExist(err) {
		log.Printf("Fichier de statistiques non trouvé, création d'un nouveau fichier")
		return nil
	}
	
	// Ouvrir le fichier
	file, err := os.Open(statsFile)
	if err != nil {
		return fmt.Errorf("erreur lors de l'ouverture du fichier stats: %v", err)
	}
	defer file.Close()
	
	// Décoder le JSON
	var stats persistentStats
	if err := json.NewDecoder(file).Decode(&stats); err != nil {
		return fmt.Errorf("erreur lors du décodage du fichier stats: %v", err)
	}
	
	// Mettre à jour les variables globales
	atomic.StoreInt64(&atomicTotalScans, stats.TotalScans)
	lastScanTime.Store(stats.LastScanTime)
	
	dailyScanMutex.Lock()
	dailyScans = stats.DailyScans
	dailyScanMutex.Unlock()
	
	return nil
}

// Sauvegarder les statistiques dans un fichier
func saveStats() error {
	statsPersistMutex.Lock()
	defer statsPersistMutex.Unlock()
	
	// Créer la structure de données à sauvegarder
	stats := persistentStats{
		TotalScans:   atomic.LoadInt64(&atomicTotalScans),
		LastScanTime: lastScanTime.Load().(string),
	}
	
	// Copier dailyScans de façon thread-safe
	dailyScanMutex.Lock()
	stats.DailyScans = make(map[string]int)
	for k, v := range dailyScans {
		stats.DailyScans[k] = v
	}
	dailyScanMutex.Unlock()
	
	// Créer le répertoire si nécessaire
	dir := filepath.Dir(statsFile)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("erreur lors de la création du répertoire: %v", err)
	}
	
	// Créer un fichier temporaire
	tmpFile := statsFile + ".tmp"
	file, err := os.Create(tmpFile)
	if err != nil {
		return fmt.Errorf("erreur lors de la création du fichier stats: %v", err)
	}
	
	// Encoder en JSON
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(stats); err != nil {
		file.Close()
		return fmt.Errorf("erreur lors de l'encodage des stats: %v", err)
	}
	
	// Fermer le fichier
	if err := file.Close(); err != nil {
		return fmt.Errorf("erreur lors de la fermeture du fichier stats: %v", err)
	}
	
	// Renommer le fichier temporaire (opération atomique)
	if err := os.Rename(tmpFile, statsFile); err != nil {
		return fmt.Errorf("erreur lors du renommage du fichier stats: %v", err)
	}
	
	log.Printf("Statistiques sauvegardées: totalScans=%d, jours=%d", 
			   stats.TotalScans, len(stats.DailyScans))
	return nil
}

// Ajout un timeout pour toutes les requêtes - VERSION CORRIGEE
func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Créer un contexte avec un timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		// Remplacer le contexte de la requête
		c.Request = c.Request.WithContext(ctx)
		
		// Canal pour détecter la fin du traitement
		done := make(chan struct{})
		
		c.Set("timeoutReached", false)
		
		go func() {
			c.Next()
			close(done)
		}()
		
		select {
		case <-done:
			// La requête s'est terminée normalement
			return
		case <-ctx.Done():
			// Timeout atteint
			c.Set("timeoutReached", true)
			c.AbortWithStatusJSON(http.StatusRequestTimeout, gin.H{
				"error": "Request timeout",
			})
			return
		}
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept, Origin, Cache-Control, Pragma, X-Requested-With, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "UP"})
}

// Fonction ScanImage corrigée qui évite les panics
func ScanImage(c *gin.Context) {
	var req models.ScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ScanResponse{
			Success: false,
			Error: &models.ErrorDetails{
				Message: "Invalid request body",
				Code:    "INVALID_REQUEST",
			},
		})
		return
	}

	cfg := config.Get()
	scannerInstance := scanner.NewScanner(
		cfg.TrivyServerURL,
		cfg.RegistryURL,
		cfg.GitlabToken,
	)

	start := time.Now()
	
	// Créer un contexte dérivé du contexte de la requête
	ctx := c.Request.Context()
	
	// Canal pour recevoir le résultat du scan
	resultChan := make(chan struct {
		result *scanner.ScanResult
		err    error
	}, 1)
	
	// Lancer le scan dans une goroutine
	go func() {
		result, err := scannerInstance.ScanImageWithContext(ctx, req.ImagePath)
		// Vérifier si le contexte a été annulé avant d'envoyer le résultat
		select {
		case <-ctx.Done():
			// Le contexte a expiré, ne pas envoyer de résultat
			log.Printf("Le contexte a expiré, ne pas envoyer de résultat pour %s", req.ImagePath)
			return
		default:
			// Envoyer le résultat seulement si le contexte est toujours valide
			resultChan <- struct {
				result *scanner.ScanResult
				err    error
			}{result, err}
		}
	}()
	
	// Attendre le résultat ou le timeout
	select {
	case <-ctx.Done():
		// Si c'est déjà un timeout, ne rien faire de plus
		// Le middleware a déjà envoyé une réponse
		log.Printf("Contexte annulé pour le scan de %s (timeout ou client déconnecté)", req.ImagePath)
		return
		
	case res := <-resultChan:
		// Vérifier si un timeout s'est produit
		timeoutReached, _ := c.Get("timeoutReached")
		if timeoutBool, ok := timeoutReached.(bool); ok && timeoutBool {
			log.Printf("Scan terminé pour %s mais le timeout a déjà été atteint", req.ImagePath)
			
			// Mettre quand même à jour les statistiques sans envoyer de réponse
			if res.err == nil {
				updateScanStats(req.ImagePath)
			}
			return
		}
		
		// Continuer normalement car aucun timeout ne s'est produit
		duration := time.Since(start).Seconds()
		
		if res.err != nil {
			c.JSON(http.StatusInternalServerError, models.ScanResponse{
				Success: false,
				Error: &models.ErrorDetails{
					Message: res.err.Error(),
					Code:    "SCAN_ERROR",
				},
			})
			return
		}
		
		// Mise à jour des stats
		updateScanStats(req.ImagePath)
		
		c.JSON(http.StatusOK, models.ScanResponse{
			Success: true,
			Data:    transformScanResult(res.result, req.ImagePath, duration),
		})
	}
}

// Fonction auxiliaire pour mettre à jour les statistiques
func updateScanStats(imagePath string) {
	// Mise à jour des stats avec opérations atomiques
	atomic.AddInt64(&atomicTotalScans, 1)
	currentTimeStr := time.Now().Format(time.RFC3339)
	lastScanTime.Store(currentTimeStr)
	
	// Mise à jour du compteur quotidien de façon thread-safe
	dateStr := time.Now().Format("2006-01-02")
	dailyScanMutex.Lock()
	dailyScans[dateStr]++
	currentCount := dailyScans[dateStr]
	dailyScanMutex.Unlock()
	
	// Journaliser pour le débogage
	log.Printf("Scan réussi pour %s! Stats mises à jour: totalScans=%d, date=%s, count=%d",
			   imagePath, atomic.LoadInt64(&atomicTotalScans), dateStr, currentCount)
	
	// Déclarer le cache comme invalide
	dailyStatsCache.Delete("last_7_days")
	
	// Sauvegarder les stats sur disque (dans une goroutine pour éviter de bloquer)
	go func() {
		if err := saveStats(); err != nil {
			log.Printf("Erreur lors de la sauvegarde des stats: %v", err)
		}
	}()
}

func GetStats(c *gin.Context) {
	log.Printf("GetStats appelé à %s", time.Now().Format(time.RFC3339))
	
	// Vérifier si les stats sont déjà en cache
	if cachedStats, found := dailyStatsCache.Get("last_7_days"); found {
		log.Printf("Utilisation du cache pour les statistiques")
		c.JSON(http.StatusOK, cachedStats)
		return
	}
	
	log.Printf("Calcul des statistiques...")
	
	// Si pas en cache, calculer les stats
	totalScans := atomic.LoadInt64(&atomicTotalScans)
	scanTime := lastScanTime.Load().(string)
	
	// Récupérer les 7 derniers jours
	today := time.Now()
	var scansPerDay []models.DailyScanCount

	// Récupérer les données quotidiennes de façon thread-safe
	dailyScanMutex.Lock()
	dailyScansCopy := make(map[string]int)
	for k, v := range dailyScans {
		dailyScansCopy[k] = v
	}
	dailyScanMutex.Unlock()
	
	// Générer les stats pour les 7 derniers jours
	for i := 6; i >= 0; i-- {
		date := today.AddDate(0, 0, -i)
		dateStr := date.Format("2006-01-02")
		count := dailyScansCopy[dateStr] // Utilise la copie locale
		scansPerDay = append(scansPerDay, models.DailyScanCount{
			Date:  dateStr,
			Count: count,
		})
	}

	response := models.StatsResponse{
		TotalScans:   totalScans,
		LastScanTime: scanTime,
		ScansPerDay:  scansPerDay,
	}
	
	log.Printf("GetStats terminé, retournant totalScans=%d, dernierScan=%s, jours=%d", 
			  totalScans, scanTime, len(scansPerDay))
	
	// Stocker en cache pour 5 minutes
	dailyStatsCache.Set("last_7_days", response, cache.DefaultExpiration)

	c.JSON(http.StatusOK, response)
}

// Transforme le résultat brut du scan en structure de données pour l'API
func transformScanResult(raw *scanner.ScanResult, imagePath string, duration float64) *models.ScanData {
	var vulns []models.Vulnerability
	summary := models.VulnSummary{}

	for _, result := range raw.Results {
		for _, v := range result.Vulnerabilities {
			vuln := models.Vulnerability{
				ID:          v.VulnerabilityID,
				Title:        v.Title,
				Description:  v.Description,
				Severity:     v.Severity,
				Package:      v.PkgName,
				Version:      v.InstalledVersion,
				FixedVersion: v.FixedVersion,
			}
			vulns = append(vulns, vuln)
			
			switch v.Severity {
			case "CRITICAL":
				summary.Critical++
			case "HIGH":
				summary.High++
			case "MEDIUM":
				summary.Medium++
			case "LOW":
				summary.Low++
			}
		}
	}
	summary.Total = len(vulns)

	return &models.ScanData{
		Target: imagePath,
		Metadata: models.ScanMetadata{
			ScanDuration: duration,
			ImageSize:    raw.Metadata.ImageSize,
			Layers:       raw.Metadata.Layers,
			ScanTime:     time.Now().Format(time.RFC3339),
			Scanner:      "Trivy",
		},
		Summary:         summary,
		Vulnerabilities: vulns,
	}
}
