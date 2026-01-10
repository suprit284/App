# 🔐 App

> A full-stack, secure authentication demo application built with Next.js 16, TypeScript, and MongoDB Atlas.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Overview

This project is a production-ready authentication system demonstrating enterprise-grade security practices, built as a technical assignment. The application showcases secure user authentication, CRUD operations, and modern deployment strategies.

**Live Demo:** [View Live Application](https://assignmentapp-ivory.vercel.app)  
**Documentation:** [View Full Documentation](/docs/)

## ✨ Features

### 🔐 Security & Authentication
- **JWT-based Authentication** with refresh token rotation
- **Secure Password Storage** using bcrypt hashing
- **XSS & CSRF Protection** with input sanitization and token validation
- **Protected Routes** with role-based access control
- **HTTP Security Headers** (CSP, HSTS, X-Frame-Options)

### 👥 User Management
- **Complete CRUD Operations** for user profiles
- **User Search** by name, username, or email
- **Profile Management** with real-time validation
- **Session Management** with automatic expiry

### 🎨 User Interface
- **Responsive Design** using Tailwind CSS (mobile-first)
- **Modern Components** with shadcn/ui and Radix UI
- **Accessibility Compliant** (WCAG 2.1 AA)
- **Real-time Form Validation** with Zod schemas

### 🚀 Deployment & DevOps
- **Multi-Platform Deployment** (Vercel + Railway)
- **CI/CD Pipeline** with GitHub Actions
- **Automated Testing** and quality checks
- **Production Monitoring** with error tracking

## 🏗️ Architecture

### **System Architecture Overview**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | **Next.js 16 (App Router)** | Full-stack React framework with server-side rendering |
| **Frontend** | **TypeScript** | Type safety and improved developer experience |
| **Frontend** | **Tailwind CSS + shadcn/ui** | Utility-first styling with accessible components |
| **Backend** | **Next.js API Routes + Node.js** | Serverless API endpoints with Node.js runtime |
| **Database** | **MongoDB Atlas (NoSQL)** | Cloud-based document database for user data |
| **Authentication** | **JWT + bcrypt + HTTP cookies** | Secure token-based authentication system |
| **Hosting** | **Vercel (Frontend) + Railway (Backend)** | Multi-platform cloud deployment strategy |
| **CI/CD** | **GitHub Actions** | Automated testing and deployment pipeline |

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui + Radix UI components
- React Hook Form + Zod validation

**Backend:**
- Next.js API Routes
- Node.js runtime
- JWT for authentication
- bcrypt for password hashing
- MongoDB Atlas + Mongoose ODM

**DevOps & Tools:**
- Vercel for frontend hosting
- Railway for backend hosting
- GitHub Actions for CI/CD
- ESLint + Prettier for code quality
- Husky for git hooks
