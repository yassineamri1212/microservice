# Quick Service Rebuild Script
# This script rebuilds specific services with optimization

param(
    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$All,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$services = @(
    "user-service",
    "signature-service", 
    "cnss-service",
    "bank-accounts-service",
    "payment-service",
    "notification-service",
    "chat-service",
    "meet-service",
    "api-gateway",
    "frontend-angular"
)

function Rebuild-Service {
    param([string]$service)
    
    Write-Host "🔄 Rebuilding $service..." -ForegroundColor Cyan
    
    if (!(Test-Path "./$service")) {
        Write-Host "❌ Service directory $service not found" -ForegroundColor Red
        return $false
    }
    
    try {
        if ($Force) {
            # Force recreation of pods
            helm upgrade --install $service ./$service --force --wait --timeout=300s
        } else {
            # Normal upgrade
            helm upgrade --install $service ./$service --wait --timeout=300s
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $service rebuilt successfully" -ForegroundColor Green
            
            # Wait for deployment to be ready
            $timeout = 60
            $count = 0
            while ($count -lt $timeout) {
                try {
                    $ready = kubectl get deployment $service -o jsonpath='{.status.readyReplicas}' 2>$null
                    if ($ready -eq "1") {
                        Write-Host "✅ $service is ready!" -ForegroundColor Green
                        return $true
                    }
                }
                catch {
                    # Continue waiting
                }
                Start-Sleep -Seconds 2
                $count += 2
            }
            
            Write-Host "⚠️ $service may still be starting up" -ForegroundColor Yellow
            return $true
        } else {
            Write-Host "❌ Failed to rebuild $service" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error rebuilding $service: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Show-Usage {
    Write-Host "🔧 Service Rebuild Script Usage:" -ForegroundColor Green
    Write-Host "  Rebuild specific service: .\rebuild-service.ps1 -ServiceName user-service" -ForegroundColor Yellow
    Write-Host "  Rebuild all services: .\rebuild-service.ps1 -All" -ForegroundColor Yellow
    Write-Host "  Force rebuild (recreate pods): .\rebuild-service.ps1 -ServiceName user-service -Force" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available services:" -ForegroundColor Cyan
    $services | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
}

# Main execution
if ($ServiceName -eq "" -and !$All) {
    Show-Usage
    exit 0
}

Write-Host "🚀 Starting Service Rebuild..." -ForegroundColor Green

if ($All) {
    Write-Host "📦 Rebuilding all services..." -ForegroundColor Cyan
    
    $successCount = 0
    $totalCount = $services.Count
    
    foreach ($service in $services) {
        if (Rebuild-Service -service $service) {
            $successCount++
        }
        Write-Host "" # Empty line for readability
    }
    
    Write-Host "📊 Rebuild Summary:" -ForegroundColor Green
    Write-Host "  ✅ Successful: $successCount/$totalCount" -ForegroundColor Green
    Write-Host "  ❌ Failed: $($totalCount - $successCount)/$totalCount" -ForegroundColor Red
    
} elseif ($ServiceName -ne "") {
    if ($services -contains $ServiceName) {
        Rebuild-Service -service $ServiceName
    } else {
        Write-Host "❌ Unknown service: $ServiceName" -ForegroundColor Red
        Write-Host "Available services: $($services -join ', ')" -ForegroundColor Yellow
        exit 1
    }
} 

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Green
Write-Host "  - Use 'kubectl get pods' to check pod status" -ForegroundColor White
Write-Host "  - Use 'kubectl logs <pod-name>' to check application logs" -ForegroundColor White
Write-Host "  - Use 'kubectl top pods' to monitor resource usage" -ForegroundColor White
Write-Host "  - Use '-Force' flag if pods are stuck in pending state" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Service rebuild completed!" -ForegroundColor Green