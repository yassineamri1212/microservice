# Resource Monitoring Script for Minikube
# This script helps monitor resource usage and identify resource-heavy pods

Write-Host "📊 Kubernetes Resource Monitor" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

function Show-ResourceUsage {
    Write-Host "`n💾 Current Resource Usage:" -ForegroundColor Cyan
    
    try {
        # Show overall cluster resource usage
        Write-Host "`n🖥️ Node Resource Usage:" -ForegroundColor Yellow
        kubectl top nodes
        
        Write-Host "`n📦 Pod Resource Usage:" -ForegroundColor Yellow
        kubectl top pods --all-namespaces --sort-by=memory
        
        Write-Host "`n🔍 Pod Status:" -ForegroundColor Yellow
        kubectl get pods -o wide
        
    } catch {
        Write-Host "❌ Error getting resource usage. Make sure metrics-server is installed." -ForegroundColor Red
        Write-Host "To install metrics-server: minikube addons enable metrics-server" -ForegroundColor Yellow
    }
}

function Show-ProblemPods {
    Write-Host "`n🚨 Problematic Pods:" -ForegroundColor Red
    
    # Find pods that are not running
    $notRunning = kubectl get pods --all-namespaces --field-selector=status.phase!=Running -o wide
    if ($notRunning) {
        Write-Host $notRunning
    } else {
        Write-Host "✅ All pods are running!" -ForegroundColor Green
    }
    
    # Find pods with high restart count
    Write-Host "`n🔄 Pods with Restarts:" -ForegroundColor Yellow
    kubectl get pods --all-namespaces -o custom-columns="NAMESPACE:.metadata.namespace,NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount" | Where-Object { $_.Split()[-1] -ne "0" -and $_.Split()[-1] -ne "RESTARTS" }
}

function Show-ResourceLimits {
    Write-Host "`n📋 Resource Limits by Pod:" -ForegroundColor Cyan
    
    $pods = kubectl get pods -o json | ConvertFrom-Json
    
    foreach ($pod in $pods.items) {
        $name = $pod.metadata.name
        $namespace = $pod.metadata.namespace
        
        Write-Host "`n📦 $name (namespace: $namespace):" -ForegroundColor White
        
        foreach ($container in $pod.spec.containers) {
            $containerName = $container.name
            $requests = $container.resources.requests
            $limits = $container.resources.limits
            
            Write-Host "  Container: $containerName" -ForegroundColor Gray
            
            if ($requests) {
                if ($requests.cpu) { Write-Host "    CPU Request: $($requests.cpu)" -ForegroundColor Blue }
                if ($requests.memory) { Write-Host "    Memory Request: $($requests.memory)" -ForegroundColor Blue }
            }
            
            if ($limits) {
                if ($limits.cpu) { Write-Host "    CPU Limit: $($limits.cpu)" -ForegroundColor Magenta }
                if ($limits.memory) { Write-Host "    Memory Limit: $($limits.memory)" -ForegroundColor Magenta }
            }
        }
    }
}

function Show-MinikubeInfo {
    Write-Host "`n🔧 Minikube Configuration:" -ForegroundColor Cyan
    
    try {
        Write-Host "Minikube Status:" -ForegroundColor Yellow
        minikube status
        
        Write-Host "`nMinikube Profile Info:" -ForegroundColor Yellow
        $cpus = minikube config get cpus 2>$null
        $memory = minikube config get memory 2>$null
        $driver = minikube config get driver 2>$null
        
        if ($cpus) { Write-Host "CPUs: $cpus" -ForegroundColor White }
        if ($memory) { Write-Host "Memory: ${memory}MB" -ForegroundColor White }
        if ($driver) { Write-Host "Driver: $driver" -ForegroundColor White }
        
    } catch {
        Write-Host "❌ Error getting minikube info" -ForegroundColor Red
    }
}

function Show-Recommendations {
    Write-Host "`n💡 Optimization Recommendations:" -ForegroundColor Green
    
    Write-Host "🔧 Resource Optimization:" -ForegroundColor Yellow
    Write-Host "  - Use the optimized Helm values for reduced resource usage" -ForegroundColor White
    Write-Host "  - Deploy only essential services during development" -ForegroundColor White
    Write-Host "  - Disable monitoring stack if not needed" -ForegroundColor White
    
    Write-Host "`n📊 Monitoring:" -ForegroundColor Yellow
    Write-Host "  - Run this script regularly to monitor resource usage" -ForegroundColor White
    Write-Host "  - Use 'kubectl logs <pod>' to check for errors" -ForegroundColor White
    Write-Host "  - Use 'kubectl describe pod <pod>' for detailed pod info" -ForegroundColor White
    
    Write-Host "`n🚀 Performance:" -ForegroundColor Yellow
    Write-Host "  - Restart minikube if it becomes unresponsive" -ForegroundColor White
    Write-Host "  - Use 'minikube stop && minikube start' for clean restart" -ForegroundColor White
    Write-Host "  - Consider increasing minikube memory if needed" -ForegroundColor White
}

# Menu system
function Show-Menu {
    Write-Host "`n📋 Select an option:" -ForegroundColor Cyan
    Write-Host "1. Show current resource usage" -ForegroundColor White
    Write-Host "2. Show problematic pods" -ForegroundColor White
    Write-Host "3. Show resource limits" -ForegroundColor White
    Write-Host "4. Show minikube info" -ForegroundColor White
    Write-Host "5. Show optimization recommendations" -ForegroundColor White
    Write-Host "6. Run full report" -ForegroundColor White
    Write-Host "7. Exit" -ForegroundColor White
    
    $choice = Read-Host "`nEnter your choice (1-7)"
    return $choice
}

# Main execution
do {
    $choice = Show-Menu
    
    switch ($choice) {
        "1" { Show-ResourceUsage }
        "2" { Show-ProblemPods }
        "3" { Show-ResourceLimits }
        "4" { Show-MinikubeInfo }
        "5" { Show-Recommendations }
        "6" { 
            Show-MinikubeInfo
            Show-ResourceUsage
            Show-ProblemPods
            Show-Recommendations
        }
        "7" { 
            Write-Host "`n👋 Goodbye!" -ForegroundColor Green
            break
        }
        default { 
            Write-Host "❌ Invalid choice. Please select 1-7." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "7") {
        Write-Host "`nPress any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
        Write-Host "📊 Kubernetes Resource Monitor" -ForegroundColor Green
        Write-Host "=============================" -ForegroundColor Green
    }
    
} while ($choice -ne "7")