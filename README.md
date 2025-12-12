# VendEase - Vendor Management System

VendEase is a robust Vendor Management System built with Django (Backend) and React (Frontend). It allows organizations to manage vendor profiles, track purchase orders, and monitor performance metrics such as On-Time Delivery Rate and Fulfillment Rate.

## Tech Stack

- **Backend:** Django 5, Django REST Framework
- **Frontend:** React, Vite, TailwindCSS (optional)
- **Database:** PostgreSQL (Production ready)

## Features

- **Vendor Profile Management:** proper CRUD operations for vendors.
- **Purchase Order Tracking:** Track POs with status (Pending, Completed, Canceled).
- **Performance Metrics:** Automatic calculation of:
  - On-Time Delivery Rate
  - Quality Rating Average
  - Average Response Time
  - Fulfillment Rate
- **Token-based Authentication** for secure API access.

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js & npm

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation
The API endpoints are available at `/api/`. Core endpoints include:
- `POST /api/vendors/` - Create a new vendor
- `GET /api/vendors/{id}/performance` - Get vendor metrics
- `POST /api/purchase_orders/` - Create a PO

## License
MIT
