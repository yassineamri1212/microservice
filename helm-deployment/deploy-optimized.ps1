# Optimized Helm Deployment Script for Minikube
# This script deploys all services with reduced resource requirements

Write-Host "🚀 Starting Optimized Helm Deployment for Minikube..." -ForegroundColor Green

# Function to check if minikube is running
function Test-MinikubeStatus {
    try {
        $status = minikube status --format="{{.Host}}"
        return $status -eq "Running"
    }
    catch {
        return $false
    }
}

# Function to wait for deployment to be ready
function Wait-ForDeployment {
    param(
        [string]$DeploymentName,
        [string]$Namespace = "default",
        [int]$TimeoutSeconds = 300
    )
    
    Write-Host "⏳ Waiting for $DeploymentName to be ready..." -ForegroundColor Yellow
    
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $timeout) {
        try {
            $ready = kubectl get deployment $DeploymentName -n $Namespace -o jsonpath='{.status.readyReplicas}' 2>$null
            if ($ready -eq "1") {
                Write-Host "✅ $DeploymentName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Deployment might not exist yet
        }
        Start-Sleep -Seconds 5
    }
    
    Write-Host "⚠️ Timeout waiting for $DeploymentName" -ForegroundColor Red
    return $false
}

# Check if minikube is running
if (!(Test-MinikubeStatus)) {
    Write-Host "❌ Minikube is not running. Please start minikube first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Minikube is running" -ForegroundColor Green

# Set resource limits for minikube
Write-Host "🔧 Configuring minikube resource limits..." -ForegroundColor Cyan
try {
    kubectl config set-context --current --namespace=default
    
    # Apply resource quotas for the default namespace
    $resourceQuota = @"
apiVersion: v1
kind: ResourceQuota
metadata:
  name: minikube-quota
  namespace: default
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
    limits.cpu: "4"
    limits.memory: 6Gi
    pods: "20"
"@
    
    $resourceQuota | kubectl apply -f -
    Write-Host "✅ Resource quota applied" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Warning: Could not set resource quota: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Deploy infrastructure services first
Write-Host "📦 Deploying Infrastructure Services..." -ForegroundColor Cyan

# 1. Deploy PostgreSQL Database
Write-Host "1️⃣ Deploying PostgreSQL..." -ForegroundColor Blue
helm upgrade --install postgresdb ./postgresdb --wait --timeout=300s
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy PostgreSQL" -ForegroundColor Red
    exit 1
}

# 2. Deploy Eureka Server (Service Discovery)
Write-Host "2️⃣ Deploying Eureka Server..." -ForegroundColor Blue
helm upgrade --install eureka-server ./eureka-server --wait --timeout=300s
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Eureka Server deployed successfully" -ForegroundColor Green
    Start-Sleep -Seconds 30  # Give Eureka time to start
} else {
    Write-Host "❌ Failed to deploy Eureka Server" -ForegroundColor Red
    exit 1
}

# 3. Deploy RabbitMQ
Write-Host "3️⃣ Deploying RabbitMQ..." -ForegroundColor Blue
helm upgrade --install rabbitmq ./rabbitmq --wait --timeout=300s
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ RabbitMQ deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy RabbitMQ" -ForegroundColor Red
    exit 1
}

# Deploy microservices with dependency order
Write-Host "🔄 Deploying Microservices..." -ForegroundColor Cyan

# 4. Deploy User Service
Write-Host "4️⃣ Deploying User Service..." -ForegroundColor Blue
helm upgrade --install user-service ./user-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "user-service"

# 5. Deploy Signature Service
Write-Host "5️⃣ Deploying Signature Service..." -ForegroundColor Blue
helm upgrade --install signature-service ./signature-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "signature-service"

# 6. Deploy CNSS Service
Write-Host "6️⃣ Deploying CNSS Service..." -ForegroundColor Blue
helm upgrade --install cnss-service ./cnss-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "cnss-service"

# 7. Deploy Bank Accounts Service
Write-Host "7️⃣ Deploying Bank Accounts Service..." -ForegroundColor Blue
helm upgrade --install bank-accounts-service ./bank-accounts-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "bank-accounts-service"

# 8. Deploy Payment Service
Write-Host "8️⃣ Deploying Payment Service..." -ForegroundColor Blue
helm upgrade --install payment-service ./payment-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "payment-service"

# 9. Deploy Notification Service
Write-Host "9️⃣ Deploying Notification Service..." -ForegroundColor Blue
helm upgrade --install notification-service ./notification-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "notification-service"

# 10. Deploy Chat Service
Write-Host "🔟 Deploying Chat Service..." -ForegroundColor Blue
helm upgrade --install chat-service ./chat-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "chat-service"

# 11. Deploy Meet Service
Write-Host "1️⃣1️⃣ Deploying Meet Service..." -ForegroundColor Blue
helm upgrade --install meet-service ./meet-service --wait --timeout=300s
Wait-ForDeployment -DeploymentName "meet-service"

# 12. Deploy API Gateway
Write-Host "1️⃣2️⃣ Deploying API Gateway..." -ForegroundColor Blue
helm upgrade --install api-gateway ./api-gateway --wait --timeout=300s
Wait-ForDeployment -DeploymentName "api-gateway"

# Deploy monitoring stack (optional, can be disabled if resources are low)
$deployMonitoring = Read-Host "Deploy monitoring stack (Loki, Grafana)? This uses additional resources. (y/N)"
if ($deployMonitoring -eq "y" -or $deployMonitoring -eq "Y") {
    Write-Host "📊 Deploying Monitoring Stack..." -ForegroundColor Cyan
    
    # Create namespaces for monitoring
    kubectl create namespace loki --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace grafana --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy Loki
    Write-Host "📈 Deploying Loki..." -ForegroundColor Blue
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    helm upgrade --install loki grafana/loki-stack -n loki -f loki-values.yaml --wait --timeout=300s
    
    # Deploy Grafana
    Write-Host "📊 Deploying Grafana..." -ForegroundColor Blue
    helm upgrade --install grafana grafana/grafana -n grafana -f grafana-values.yaml --wait --timeout=300s
    
    Write-Host "✅ Monitoring stack deployed" -ForegroundColor Green
}

# Deploy frontend
Write-Host "🎨 Deploying Frontend..." -ForegroundColor Cyan
helm upgrade --install frontend-angular ./frontend-angular --wait --timeout=300s
Wait-ForDeployment -DeploymentName "frontend-angular"

# Deploy PgAdmin for database management
Write-Host "🔧 Deploying PgAdmin..." -ForegroundColor Blue
helm upgrade --install pgadmin ./pgadmin --wait --timeout=300s

Write-Host "🎉 Optimized deployment completed!" -ForegroundColor Green

# Display service information
Write-Host "`n📋 Service Information:" -ForegroundColor Cyan
Write-Host "Getting service URLs..." -ForegroundColor Yellow

try {
    $services = kubectl get svc -o wide
    Write-Host $services
    
    Write-Host "`n🌐 To access services:" -ForegroundColor Cyan
    Write-Host "Frontend: minikube service frontend-angular --url" -ForegroundColor Yellow
    Write-Host "PgAdmin: minikube service pgadmin --url" -ForegroundColor Yellow
    Write-Host "API Gateway: minikube service api-gateway --url" -ForegroundColor Yellow
    
    if ($deployMonitoring -eq "y" -or $deployMonitoring -eq "Y") {
        Write-Host "Grafana: kubectl port-forward svc/grafana 3000:80 -n grafana" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️ Could not retrieve service information" -ForegroundColor Yellow
}

Write-Host "`n💡 Tips for low resource usage:" -ForegroundColor Green
Write-Host "- Services are configured with minimal resource requirements" -ForegroundColor White
Write-Host "- JVM heap sizes are optimized for containers" -ForegroundColor White
Write-Host "- Health probes have longer intervals to reduce CPU usage" -ForegroundColor White
Write-Host "- Logging levels are set to WARN to reduce I/O" -ForegroundColor White
Write-Host "- Use 'kubectl top pods' to monitor resource usage" -ForegroundColor White

Write-Host "`n🔄 To rebuild a specific service:" -ForegroundColor Green
Write-Host "helm upgrade --install <service-name> ./<service-name> --force" -ForegroundColor White

Write-Host "`n✅ Deployment script completed successfully!" -ForegroundColor Green