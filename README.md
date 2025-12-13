<div align="center">

# Homee System - Web Client

### Real-time web application for home environmental monitoring

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3.4-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Azure](https://img.shields.io/badge/Azure-Web%20App-0078D4?logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/)

</div>

## 📖 Overview

Frontend for **Homee System** - A React-based web application that provides device management, real-time environmental data monitoring, historical measurement analysis, and automated PDF report generation for home IoT sensors. Monitor air quality, temperature, humidity, and 15+ environmental parameters across all your devices with an intuitive Material-UI interface and live WebSocket updates.

<div align="left">

## 👇 Live demo

[![Visit Application](https://img.shields.io/badge/Azure-Visit_Demo-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://homeesystem.azurewebsites.net/)

</div>

## ✨ Key Highlights

- **Real-time data streaming** via SignalR WebSocket connections
- **Historical data analysis** with advanced filtering capabilities
- **PDF report generation** for any time period
- **Modern Material-UI design** with dark theme
- **Containerized with Docker** for consistent deployment
- **Published to Azure Web App Service** with automated CI/CD

## 🛠️ Technology
- **React 19.1.1** - Modern UI library with hooks
- **React Router DOM 7.9.3** - Client-side routing
- **Vite 7.1.7** - Next-generation frontend tooling
- **Material-UI (MUI) 7.3.4** - Comprehensive React component library
- **Emotion** - CSS-in-JS styling solution
- **@microsoft/signalr 9.0.6** - WebSocket-based real-time updates
- **Day.js 1.11.18** - Date manipulation and formatting
- **cronstrue 3.3.0** - Human-readable cron expressions
- **use-debounce 10.0.6** - Performance optimization hooks
- **ESLint 9.36.0** - Code quality and consistency
- **TypeScript types** - Enhanced development experience

---

## 🏠 Home Dashboard

Welcome screen with quick navigation to all major features and system overview.

<div align="center">

![Home Dashboard](/Assets/Homee_Home.gif)

</div>

## 📱 Devices

Comprehensive device management with real-time monitoring.

- ✅ View and manage all IoT devices
- 🔴 Real-time device status monitoring
- ⚙️ Configure device settings and locations
- 💚 Track device connectivity and health
- 🔍 Filter and search devices by name, location, or status

<div align="center">

![Devices Page](/Assets/Homee_Devices.gif)

</div>

## 📊 Measurements

Browse and analyze historical environmental data.

- 📈 Comprehensive environmental data history
- 🔎 Advanced filtering by date range, location, and device
- 🌡️ **Support for multiple environmental parameters:**
  - Temperature
  - Relative Humidity
  - Carbon Dioxide
  - Volatile Organic Compounds
  - Particulate Matter
  - Formaldehyde
  - Carbon Monoxide
  - Ozone
  - Ammonia
  - Air Flow Rate
  - Air Ionization Level
  - Oxygen Concentration
  - Radon Gas
  - Illuminance
  - Sound Pressure Level

<div align="center">

![Measurements Page](/Assets/Homee_Measurements.gif)

</div>

## 📈 Live Measurements

Real-time environmental monitoring with instant updates.

- 🔴 Real-time data streaming from all active devices
- ⚡ WebSocket-based updates for instant readings
- 📊 Interactive data visualization
- 🌍 Monitor current environmental conditions across locations
- 📋 Expandable measurement details with complete parameter breakdowns

<div align="center">

![Live Measurements](/Assets/Homee_MeasurementsLive.gif)

</div>

## 📄 Reports

Generate comprehensive PDF reports for any time period.

- 📝 Create detailed PDF reports with custom parameters
- 📅 **Flexible period selection:**
  - Hourly reports
  - Daily summaries
  - Weekly aggregations
  - Monthly overviews
  - Custom date ranges
- 🎯 Filter by locations and measurement types
- 📊 Track report generation status
- ⬇️ Download completed reports

<div align="center">

![Reports Page](/Assets/Homee_Raports.gif)

</div>