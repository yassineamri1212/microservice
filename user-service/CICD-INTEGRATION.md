# User Service CI/CD Integration

## Overview
Successfully added user-service to the CI/CD pipeline workflow to enable automated building, testing, and deployment.

## Changes Made to `.github/workflows/ci-cd.yml`

### 1. **Change Detection**
Added user-service to the path filter for detecting changes:

```yaml
outputs:
  user: ${{ steps.filter.outputs.user }}  # Added

filters: |
  user:                                    # Added
    - 'user-service/**'                   # Added
```

### 2. **Build Job**
Added complete user-service build job with:

```yaml
user-service:
  needs: changes
  if: needs.changes.outputs.user == 'true'
  runs-on: ubuntu-latest
  steps:
    - Java 17 setup
    - Maven build with -DskipTests
    - Docker build and push
    - Multi-tag strategy (branch-based + SHA)
```

### 3. **Docker Tags**
The service will be tagged as:
- `theoldisback/user-service:stb` (for STB branch)
- `theoldisback/user-service:latest` (for main branch)
- `theoldisback/user-service:{github.sha}` (commit-specific)

### 4. **Deployment Dependencies**
Updated deployment job dependencies:

```yaml
deploy:
  needs: [..., user-service]  # Added user-service
```

### 5. **Deployment Conditions**
Added user-service to deployment trigger conditions:

```yaml
if: >-
  always() && (
  ... ||
  needs.changes.outputs.user == 'true'  # Added
  )
```

### 6. **Helm Deployment**
Added user-service to the deployment script:

```powershell
if ('${{ needs.changes.outputs.user }}' -eq 'true') {
  helm upgrade --install user-service ./helm-deployment/user-service --set image.tag=${{ github.sha }} --namespace default
}
```

## Workflow Behavior

### **Trigger Conditions**
The user-service pipeline will trigger when:
- Changes are made to any files in `user-service/**`
- Push or PR to `main` or `STB` branches

### **Pipeline Steps**
1. **Detect Changes**: Scan for user-service file changes
2. **Build**: Compile Java code with Maven
3. **Test**: Run unit tests (if enabled)
4. **Package**: Create Docker image
5. **Push**: Upload to DockerHub registry
6. **Deploy**: Update Kubernetes deployment via Helm

### **Integration Points**
- ✅ **Change Detection**: Monitors `user-service/**` directory
- ✅ **Java Build**: Maven clean package with Java 17
- ✅ **Docker Build**: Multi-platform container creation
- ✅ **Registry Push**: DockerHub integration with secrets
- ✅ **Helm Deploy**: Kubernetes deployment automation
- ✅ **Dependency Management**: Proper job sequencing

### **Environment Variables Used**
- `DOCKERHUB_USERNAME`: DockerHub username (from secrets)
- `DOCKERHUB_TOKEN`: DockerHub access token (from secrets)
- `KUBECONFIG`: Kubernetes config path for deployment

## Testing the Integration

### **To trigger the pipeline:**
1. Make any change to files in `user-service/`
2. Commit and push to `STB` or `main` branch
3. Pipeline will automatically detect changes and build/deploy

### **Expected Results:**
- ✅ Docker image built and pushed
- ✅ Helm chart deployed to minikube
- ✅ Service registered with Eureka
- ✅ Available via API Gateway at `/api/user/**`

## Verification Commands

After deployment, verify with:

```bash
# Check deployment
kubectl get pods -l app=user-service

# Check service
kubectl get svc user-service

# Check logs
kubectl logs -l app=user-service

# Test API via gateway
curl -k https://stb-stages.com/api/user/health
```

The user-service is now fully integrated into the automated CI/CD pipeline! 🚀
