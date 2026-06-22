# Prometheus Deployment Script for Minikube
Write-Host "🚀 Deploying Prometheus to Minikube..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "Chart.yaml")) {
    Write-Host "❌ Error: Chart.yaml not found. Please run this script from the prometheus helm directory." -ForegroundColor Red
    exit 1
}

# Check if monitoring namespace exists
Write-Host "📁 Checking monitoring namespace..." -ForegroundColor Yellow
$namespace = kubectl get namespace monitoring --ignore-not-found
if (!$namespace) {
    Write-Host "📁 Creating monitoring namespace..." -ForegroundColor Yellow
    kubectl create namespace monitoring
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create monitoring namespace" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Monitoring namespace already exists" -ForegroundColor Green
}

# Deploy Prometheus using Helm
Write-Host "🎯 Installing Prometheus with Helm..." -ForegroundColor Yellow
helm install prometheus . --namespace monitoring --create-namespace --replace

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prometheus installed successfully!" -ForegroundColor Green
    
    Write-Host "⏳ Waiting for Prometheus pods to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=300s
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prometheus is ready!" -ForegroundColor Green
        
        # Show deployment status
        Write-Host "`n📊 Prometheus Deployment Status:" -ForegroundColor Cyan
        kubectl get pods -n monitoring
        kubectl get svc -n monitoring
        kubectl get pvc -n monitoring
        
        Write-Host "`n🌐 Access Prometheus:" -ForegroundColor Cyan
        Write-Host "Local: kubectl port-forward -n monitoring svc/prometheus 9090:9090" -ForegroundColor White
        Write-Host "Then open: http://localhost:9090" -ForegroundColor White
        
        Write-Host "`n🔧 Grafana Datasource URL:" -ForegroundColor Cyan
        Write-Host "http://prometheus.monitoring.svc.cluster.local:9090" -ForegroundColor White
        
    } else {
        Write-Host "⚠️ Prometheus installed but pods not ready yet. Check status with:" -ForegroundColor Yellow
        Write-Host "kubectl get pods -n monitoring" -ForegroundColor White
    }
    
} else {
    Write-Host "❌ Failed to install Prometheus" -ForegroundColor Red
    Write-Host "Check the error above and try again" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Prometheus deployment completed!" -ForegroundColor Green
