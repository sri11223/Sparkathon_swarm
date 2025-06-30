# Frontend Applications

This directory contains all frontend applications for the SwarmFill Network platform.

## 📱 Mobile Applications (React Native)

### Customer Mobile App
**Location**: `customer-mobile-app/`
**Purpose**: Customer-facing mobile application for browsing, ordering, and tracking

**Key Features**:
- Hub discovery with Google Maps integration
- Product browsing and search
- Real-time order tracking
- Secure payment processing
- Rating and review system

### Hub Owner Mobile App
**Location**: `hubowner-mobile-app/`
**Purpose**: Hub owners manage their micro-fulfillment operations

**Key Features**:
- Inventory management with barcode scanning
- Earnings dashboard and analytics
- Customer access control
- Storage optimization tools
- Performance metrics tracking

### Courier Mobile App
**Location**: `courier-mobile-app/`
**Purpose**: Community couriers manage deliveries and earn income

**Key Features**:
- Job acceptance and batch optimization
- AI-powered route navigation
- Delivery confirmation system
- Earnings tracking and analytics
- Performance rating system

## 🖥️ Web Dashboard (React.js)

### Admin Web Dashboard
**Location**: `admin-web-dashboard/`
**Purpose**: Comprehensive system administration and monitoring

**Key Features**:
- Real-time network monitoring
- SmartLoad AI control panel
- Crisis management coordination
- Hub performance analytics
- User management and support

## 🔧 Shared Components
**Location**: `shared-components/`
**Purpose**: Reusable UI components across all applications

**Components Include**:
- Authentication forms
- Map components
- Chart and analytics widgets
- Payment processing components
- Notification systems

## 🚀 Development Setup

### Prerequisites
```bash
Node.js >= 16.0.0
Expo CLI (for mobile apps)
React Native development environment
```

### Mobile Apps Setup
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Setup Customer App
cd customer-mobile-app
npm install
expo start

# Setup Hub Owner App  
cd hubowner-mobile-app
npm install
expo start

# Setup Courier App
cd courier-mobile-app
npm install
expo start
```

### Web Dashboard Setup
```bash
cd admin-web-dashboard
npm install
npm start
```

## 📋 Technology Stack

### Mobile Apps
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit
- **UI Components**: React Native Elements
- **Maps**: React Native Maps
- **Camera**: Expo Camera (for barcode scanning)
- **Storage**: AsyncStorage
- **Push Notifications**: Expo Notifications

### Web Dashboard
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI / Ant Design
- **State Management**: Redux Toolkit
- **Charts**: Chart.js / Recharts
- **Maps**: Google Maps React
- **Real-time**: Socket.io-client

## 🎨 UI/UX Design Guidelines

### Design System
- **Colors**: Primary Blue (#1976d2), Secondary Orange (#ff9800)
- **Typography**: Roboto font family
- **Spacing**: 8px grid system
- **Components**: Material Design principles

### Mobile Responsiveness
- Responsive design for multiple screen sizes
- Touch-friendly interactions
- Accessibility compliance (WCAG 2.1)

### User Experience
- Intuitive navigation flows
- Real-time feedback and notifications
- Offline capabilities where possible
- Fast loading and smooth animations

## 📱 App Screenshots

Screenshots will be stored in `/demo-assets/screenshots/` with the following structure:
```
screenshots/
├── customer-app/
├── hubowner-app/
├── courier-app/
└── admin-dashboard/
```

## 🧪 Testing Strategy

### Unit Testing
- Component testing with Jest and React Testing Library
- Snapshot testing for UI consistency

### Integration Testing
- API integration testing
- Navigation flow testing

### End-to-End Testing
- User journey testing with Detox (mobile)
- Cross-platform compatibility testing

## 🚀 Build and Deployment

### Development Builds
```bash
# Mobile apps (Expo)
expo build:android
expo build:ios

# Web dashboard
npm run build
```

### Demo Deployment
- Mobile apps: Expo sharing/TestFlight
- Web dashboard: Netlify/Vercel deployment

**Ready for Sparkathon demo and beyond! 🎯**
