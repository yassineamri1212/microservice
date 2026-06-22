# Keycloak Helm Chart with Persistent Storage and Realm Import

This Helm chart deploys Keycloak with the following features:

## Features

1. **Persistent Storage**: Data is preserved across pod restarts
2. **Realm Import**: Automatically imports your custom realm configuration
3. **LoadBalancer Service**: Exposes Keycloak on port 8086 (NodePort 30080)

## Components Added

### 1. Persistent Volume
- **Storage Class**: Default (can be customized)
- **Access Mode**: ReadWriteOnce
- **Size**: 8Gi (configurable)
- **Mount Path**: `/opt/keycloak/data`

### 2. Realm Import
- **ConfigMap**: Contains your realm configuration from `text.txt`
- **Init Container**: Imports the realm before Keycloak starts
- **Auto Import**: Configured to import realm on startup

## Usage

### Deploy Keycloak
```powershell
# Install new release
.\deploy-keycloak.ps1 -Action install

# Upgrade existing release
.\deploy-keycloak.ps1 -Action upgrade

# Check status
.\deploy-keycloak.ps1 -Action status

# Uninstall
.\deploy-keycloak.ps1 -Action uninstall
```

### Manual Helm Commands
```powershell
# Install
helm install keycloak .\keycloak\ --namespace default --create-namespace

# Upgrade
helm upgrade keycloak .\keycloak\ --namespace default

# Uninstall
helm uninstall keycloak --namespace default
```

## Access Keycloak

- **URL**: http://localhost:8086
- **Admin Console**: http://localhost:8086/admin
- **Username**: admin
- **Password**: admin

## Configuration

### Persistence Settings
```yaml
persistence:
  enabled: true
  storageClass: ""  # Use default storage class
  accessMode: ReadWriteOnce
  size: 8Gi
  mountPath: /opt/keycloak/data
```

### Realm Import Settings
```yaml
realmImport:
  enabled: true
  realmData: |
    # Your realm JSON configuration
```

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -l app=keycloak
kubectl describe pod <keycloak-pod-name>
```

### Check Logs
```bash
kubectl logs <keycloak-pod-name> -c keycloak
kubectl logs <keycloak-pod-name> -c realm-import  # Init container logs
```

### Check Persistent Volume
```bash
kubectl get pv
kubectl get pvc
```

### Check ConfigMap
```bash
kubectl get configmap <release-name>-keycloak-realm -o yaml
```

## What's Been Fixed

1. **Data Persistence**: Your Keycloak configuration now survives PC restarts
2. **Realm Import**: Your custom realm from `text.txt` is automatically imported
3. **Proper Helm Structure**: Clean, maintainable Helm chart structure
4. **Volume Management**: Proper persistent volume and ConfigMap management

## Files Modified/Created

- `templates/pvc.yaml` - Persistent Volume Claim
- `templates/configmap.yaml` - Realm configuration
- `templates/deployment.yaml` - Updated with volumes and init container
- `values.yaml` - Added persistence and realm import configuration
- `deploy-keycloak.ps1` - Deployment script
- `README.md` - This documentation
