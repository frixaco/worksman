package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	
	// Configure CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	
	const path = "/data/data.json"

	r.POST("/sync", func(ctx *gin.Context) {
		file, err := os.Create(path)
		if err != nil {
			fmt.Println("Failed to create or truncate data file", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create or truncate data file",
			})
		}
		defer file.Close()

		var body map[string]any
		if err := ctx.ShouldBindJSON(&body); err != nil {
			fmt.Println("Failed to parse body as JSON", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to parse body as JSON",
			})
		}

		jsonData, err := json.MarshalIndent(body, "", "  ")
		if err != nil {
			fmt.Println("Failed to convert request body struct to bytes", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to convert request body struct to bytes",
			})
		}

		err = os.WriteFile(path, jsonData, 0644)
		if err != nil {
			fmt.Println("Failed to save data", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save data",
			})
		}

		ctx.JSON(http.StatusOK, gin.H{
			"success": "Successfully saved tab data",
		})
	})

	r.GET("/sync", func(ctx *gin.Context) {
		data, err := os.ReadFile(path)
		if err != nil {
			fmt.Println("Failed to read data", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read data",
			})
		}

		ctx.Data(http.StatusOK, "application/json", data)
	})

	r.Run()
}
