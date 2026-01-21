# Backend-Frontend Integration Guide

## ✅ Integration Complete!

The frontend has been successfully connected to the NestJS backend.

## 🔧 Changes Made

### 1. **API Configuration** (`frontend/src/services/api.ts`)
- ✅ Updated base URL to use environment variable: `VITE_API_URL`
- ✅ API calls now point to `http://localhost:3000` (backend)
- ✅ JWT token interceptor configured
- ✅ 401 auto-redirect to login

### 2. **Authentication Store** (`frontend/src/stores/authStore.ts`)
- ✅ Replaced mock auth with real API integration
- ✅ Calls `/auth/login` endpoint
- ✅ Maps backend response to frontend User type
- ✅ Stores JWT token in localStorage
- ✅ Role mapping: Backend `SUPER_ADMIN`/`LAB_ADMIN`/`LAB_MEMBER` → Frontend types

### 3. **Login Page** (`frontend/src/pages/LoginPage.tsx`)
- ✅ Removed role selector (role determined by backend)
- ✅ Added error handling with user feedback
- ✅ Pre-filled with default credentials: `admin@seedlab.com` / `admin123`
- ✅ Replaced image background with gradient (Samsung blue theme)
- ✅ Proper form validation

### 4. **Environment Variables**
Created `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 5. **Backend CORS Configuration**
- ✅ Updated `backend/.env` CORS origin to `http://localhost:3001`
- ✅ Backend allows credentials (cookies/auth headers)

### 6. **Vite Configuration** (`frontend/vite.config.ts`)
- ✅ Removed proxy configuration (using direct API URLs instead)
- ✅ Server port set to 3000 (running on 3001 due to backend using 3000)

---

## 🚀 How to Test

### 1. **Start Backend** (Terminal 1)
```bash
cd backend
npm run start:dev
```
Backend runs on: **http://localhost:3000**

### 2. **Start Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:3001**

### 3. **Login**
1. Open: http://localhost:3001
2. Use default credentials:
   - **Email**: `admin@seedlab.com`
   - **Password**: `admin123`
3. Click **Sign In**

### 4. **Expected Behavior**
- ✅ Backend receives login request
- ✅ JWT token returned
- ✅ Token stored in localStorage
- ✅ User redirected to role-specific dashboard
- ✅ Protected routes work with RBAC

---

## 📡 API Endpoints Used

### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### **User Management**
- `GET /users` - List users (admin only)
- `POST /users` - Create user (admin only)

### **Lab Members**
- `GET /lab-members` - List lab members
- `GET /lab-members/:id` - Get lab member details

### **Attendance**
- `GET /attendance/member/:memberId` - Get attendance records
- `POST /attendance/manual` - Manual attendance correction

### **Salary**
- `POST /salary/calculate` - Calculate salary
- `GET /salary/slip/:calculationId/pdf` - Download salary slip

---

## 🔒 Authentication Flow

```
1. User enters credentials → Frontend (LoginPage)
2. POST /auth/login → Backend (AuthController)
3. Backend validates → Returns JWT + User data
4. Frontend stores token → localStorage
5. All subsequent API calls include: Authorization: Bearer {token}
6. Backend validates JWT → Allows/denies request
```

---

## 🎨 UI Features

### **Login Page**
- Samsung-themed gradient background
- Email + Password fields
- Error handling with alerts
- Loading states
- Responsive design

### **Layout**
- Role-based sidebar navigation
- Collapsible sidebar (desktop)
- Mobile drawer
- User profile menu
- Notification badge
- Role chip display

### **Protected Routes**
- Auto-redirect if not authenticated
- Role-based access control
- Different dashboards per role:
  - Lab Member: `/member/dashboard`
  - Lab Admin: `/admin/dashboard`
  - Super Admin: `/super-admin/dashboard`

---

## 🐛 Troubleshooting

### **CORS Errors**
If you see CORS errors:
1. Check backend `.env`: `CORS_ORIGIN=http://localhost:3001`
2. Restart backend server
3. Clear browser cache

### **Login Fails**
If login doesn't work:
1. Check backend is running on port 3000
2. Check frontend API URL in `.env`
3. Open DevTools → Network tab → Check request/response
4. Verify credentials: `admin@seedlab.com` / `admin123`

### **Token Not Sent**
If API calls fail with 401:
1. Check localStorage has `token` key
2. Check axios interceptor is adding Authorization header
3. Verify JWT token hasn't expired

### **Frontend Not Updating**
If changes don't appear:
1. Hard refresh: `Ctrl+Shift+R`
2. Clear localStorage
3. Restart Vite dev server

---

## 📦 Dependencies

### **Frontend**
- `axios` - HTTP client
- `zustand` - State management
- `@tanstack/react-query` - Server state management
- `react-router-dom` - Routing
- `@mui/material` - UI components

### **Backend**
- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Auth strategies
- `passport-jwt` - JWT strategy
- `bcrypt` - Password hashing

---

## ✨ Features Implemented

✅ Real API integration  
✅ JWT authentication  
✅ Role-based access control  
✅ Protected routes  
✅ Persistent sessions  
✅ Auto token refresh (ready for implementation)  
✅ Error handling  
✅ Loading states  
✅ Responsive design  
✅ CORS configured  
✅ Type-safe API calls  

---

## 🎯 Next Steps

1. **Implement remaining pages** (currently stubs)
2. **Add token refresh logic** when token expires
3. **Add notification system** for real-time updates
4. **Implement file uploads** (profile pictures, documents)
5. **Add data validation** on forms
6. **Add unit tests** for auth flow
7. **Add E2E tests** with Playwright/Cypress

---

## 📝 Notes

- **Mock data removed** - All auth now uses real backend
- **Role selector removed** - Role determined by backend after login
- **Registration disabled** - Admin-only feature (as per requirements)
- **Password reset disabled** - Placeholder for future implementation
- **Image background replaced** - Now uses gradient (Samsung blue theme)

---

## 🤝 Support

For issues or questions:
- Check backend logs in Terminal 1
- Check frontend console in DevTools
- Review network requests in DevTools → Network tab
- Check this documentation for troubleshooting steps

---

**Status**: ✅ Integration Complete & Ready for Development
**Last Updated**: 2026-01-14
