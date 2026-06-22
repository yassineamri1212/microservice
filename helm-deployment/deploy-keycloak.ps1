# Keycloak Deployment Script
# This script helps deploy/upgrade the Keycloak Helm chart with persistent storage and realm import

param(
    [Parameter(Mandatory=$true)]
    [string]$Action = "install", # install, upgrade, or uninstall
    
    [string]$ReleaseName = "keycloak",
    [string]$Namespace = "default"
)

$HelmChartPath = "c:\Users\theol\OneDrive\Desktop\final\helm-deployment\keycloak"

Write-Host "Keycloak Helm Chart Management" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

switch ($Action.ToLower()) {
    "install" {
        Write-Host "Installing Keycloak with release name: $ReleaseName" -ForegroundColor Yellow
        helm install $ReleaseName $HelmChartPath --namespace $Namespace --create-namespace
    }
    "upgrade" {
        Write-Host "Upgrading Keycloak release: $ReleaseName" -ForegroundColor Yellow
        helm upgrade $ReleaseName $HelmChartPath --namespace $Namespace
    }
    "uninstall" {
        Write-Host "Uninstalling Keycloak release: $ReleaseName" -ForegroundColor Red
        helm uninstall $ReleaseName --namespace $Namespace
    }
    "status" {
        Write-Host "Checking status of Keycloak release: $ReleaseName" -ForegroundColor Blue
        helm status $ReleaseName --namespace $Namespace
    }
    default {
        Write-Host "Invalid action. Use: install, upgrade, uninstall, or status" -ForegroundColor Red
        exit 1
    }
}

if ($Action.ToLower() -in @("install", "upgrade")) {
    Write-Host "`nWaiting for Keycloak to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=keycloak --namespace $Namespace --timeout=300s
    
    Write-Host "`nGetting Keycloak service details..." -ForegroundColor Blue
    kubectl get svc -l app=keycloak --namespace $Namespace
    
    Write-Host "`nKeycloak should be accessible at:" -ForegroundColor Green
    Write-Host "- Admin Console: http://localhost:8086/admin" -ForegroundColor Cyan
    Write-Host "- Username: admin" -ForegroundColor Cyan
    Write-Host "- Password: admin" -ForegroundColor Cyan
}
