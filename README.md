# EcoRoute

EcoRoute is a smart logistics and route-optimization web application designed to improve delivery planning in Morocco.

The platform combines interactive mapping, AI-assisted route decisions, delivery tracking, operational alerts, and CO₂ impact reporting in one modern dashboard.

## ⚠️ Prototype Notice

EcoRoute is a prototype created for academic and demonstration purposes.  
It is not a final commercial product, and some features are simulated to represent how an intelligent logistics platform could work in a real environment.

The project is open to modifications, improvements, and future integrations, including real-time traffic APIs, weather APIs, GPS fleet tracking, fuel price data, and backend decision-making systems.

## 🚚 Project Overview

EcoRoute helps logistics teams plan smarter delivery routes by considering distance, estimated time, fuel consumption, cost, CO₂ emissions, traffic conditions, incidents, and operational constraints.

The application focuses on practical logistics use cases in Morocco and demonstrates how digital tools can support smarter and more sustainable transport decisions.

## ✨ Main Features

- Interactive route planning between Moroccan cities
- AI-assisted route recommendation
- Route modes:
  - AI optimized
  - Eco mode
  - Fast route
- Delivery tracking with active truck simulation
- Incident detection and route recalculation
- Real-time style alerts
- Estimated ETA before and after recalculation
- Fuel, cost, distance, duration, and CO₂ indicators
- Dashboard KPIs
- Mobile-responsive interface
- Team/project presentation page
- Modern dark logistics dashboard design

## 🧠 AI Situation Detection

Instead of manually selecting an operational scenario, EcoRoute automatically estimates the situation based on the selected route and simulated real-time conditions.

The AI can display situations such as:

- Normal conditions
- Urban congestion
- Weather risk
- Incident detected

This makes the platform feel closer to a real intelligent logistics assistant.

## 🗺️ Technologies Used

- React
- Vite
- JavaScript
- React Leaflet
- Leaflet
- Lucide React icons
- CSS-in-JS styling
- Vercel for deployment

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

Go to the project folder:

```bash
cd YOUR_REPOSITORY_NAME
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## 🏗️ Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🌍 Deployment

The project can be deployed for free using Vercel.

Recommended settings:

- Framework: Vite
- Build command:

```bash
npm run build
```

- Output directory:

```bash
dist
```

## 📁 Project Structure

```bash
ecoroute/
├── public/
├── src/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 👥 Project Team

EcoRoute was mainly developed by **El Mehdi Omar Ben El Haj**.

The project was also supported by the team through the project idea, logistics scenario, testing, feedback, and presentation of the prototype.

### Main Developer

- **El Mehdi Omar Ben El Haj**

### Team Members

- Ossama Ait Abdelhalim
- Hajar Ait Saleh
- Bilal Laadioui
- Saad Daoud
- Taybi Zayd
- Kaoutar Enndal

## 🎯 Project Objective

The objective of EcoRoute is to demonstrate how artificial intelligence and digital tools can support logistics decision-making by reducing transport costs, improving delivery reliability, optimizing routes, and supporting more sustainable operations.

## ♻️ Sustainability Focus

EcoRoute includes CO₂ indicators and eco-routing logic to highlight the environmental impact of logistics decisions.

The goal is not only to deliver faster, but also to deliver smarter and more sustainably.

## 📌 Project Status

EcoRoute is currently a functional prototype.  
The platform demonstrates the concept of AI-assisted logistics optimization, but it is still open to modifications, improvements, and technical extensions.

Some data and route decisions are simulated for demonstration purposes. Future versions can be connected to real APIs and logistics systems, such as:

- Live traffic data
- Weather data
- GPS fleet tracking
- Fuel price updates
- Real delivery management systems
- Backend AI decision engines

## 📄 License

This project is for academic and demonstration purposes.
