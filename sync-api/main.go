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

func saveToFile(ctx *gin.Context, path string) {
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

}

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

	r.POST("/sync/:routeName", func(ctx *gin.Context) {
		routeName := ctx.Param("routeName")
		path := fmt.Sprintf("/data/%s.json", routeName)
		saveToFile(ctx, path)
	})

	r.GET("/sync/:routeName", func(ctx *gin.Context) {
		routeName := ctx.Param("routeName")
		path := fmt.Sprintf("/data/%s.json", routeName)
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
