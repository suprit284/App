# 5. Deployment View

## 5.1 Infrastructure Overview

### 5.1.1 Deployment Architecture
The application employs a **multi-platform cloud deployment strategy** separating frontend, backend, and database across specialized hosting services for optimal performance and scalability.

**Deployment Topology** (see diagram: `/docs/diagrams/deployment-architecture.png`):
1. **Frontend:** Vercel (Global CDN, Serverless Functions)
2. **Backend:** Railway (Containerized Node.js Services)
3. **Database:** MongoDB Atlas (Managed Cloud Database)
4. **CI/CD:** GitHub Actions (Automated Workflows)

*Diagram: This illustrates the distributed deployment architecture with communication flows between platforms.*



## 5.2 Platform-Specific Deployment

### 5.2.1 Vercel Frontend Deployment

#### **Configuration Files:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://app-backend-production-cfaf.up.railway.app/"
  }
}