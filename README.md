# 🏍️ RGF Rebate Scheme System

Welcome to the **RGF Rebate Scheme System**, a comprehensive web application designed to facilitate, manage, and track rebate applications for E-Motorcycles. This platform streamlines workflows between various stakeholders including applicants, analysts, program managers, and asset financiers to process rebates securely and efficiently.

## 🌟 Key Features

- **Multi-Role Portal Access:** Customized dashboards, functionalities, and notifications based on the exact organizational role of the logged-in user.
- **Dynamic Application Workflow:** Multi-step application submissions with robust document handling and validation.
- **Application Tracking:** Detailed DataTables and Kanban-like tracking of E-Moto rebate applications from "In Development" to "Approved" and "Paid".
- **Interactive Dashboards:** Real-time metrics, analytics, and KPIs visualized through dynamic charts.
- **Robust Notification System:** Event-driven alerts that route users perfectly to actionable tasks across organizations.
- **Configurable Access Control:** Comprehensive Role-Based Access Control (RBAC) ensuring data protection and privacy between competing E-Moto companies and banks.
- **UI/UX Excellence:** Modern, responsive, and mobile-friendly design built with Tailwind CSS, Framer Motion, and accessible UI components.

## 🛠️ Tech Stack

This project is built using modern web development standards to ensure scalability and maintainability.

- **Frontend Framework:** React 18, Vite
- **Styling:** Tailwind CSS, Framer Motion
- **Language:** TypeScript
- **UI Components:** Radix UI (Headless components), Lucide React (Icons)
- **Backend/Database Integration:** Supabase (Auth, Postgres, Storage)
- **Routing:** React Router DOM (Simulated structural flows via internal state)

## 👥 Supported Roles

The system supports a rich ecosystem of distinct users with specific responsibilities:

1. **System Admin (`SYSTEM_ADMIN`)** - Full platform oversight and role management.
2. **E-Moto Company (`applicant`)** - Can submit new rebate applications, track statuses, and manage internal users.
3. **Asset Financier (`ASSET_FINANCIER_ADMIN`)** - Banks and MFIs managing applications associated with lease agreements, approving/rejecting leases, and overseeing their staff.
4. **Rebate Analyst (`REBATE_ANALYST`)** - Initial verification and document validation of incoming applications.
5. **Rebate Manager (`REBATE_MANAGER`)** - Approves validated applications and oversees analyst queues.
6. **E-Moto Program Manager (`E_MOTO_PROGRAM_MANAGER`)** - High-level oversight of entire rebate program deployments.
7. **Designated Finance Officer (`DESIGNATED_FINANCE_OFFICER`)** - Approves and processes grouped payments and financial disbursements.
8. **M&E Team (`ME_TEAM`)** / **External Reviewer (`EXTERNAL_REVIEWER`)** - Reviewing system analytics and verifying field operations.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js installed in your environment. We recommend Node.js v18+.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/himTresor1/rebate-scheme.git
   ```
2. **Navigate into the project directory:**
   ```bash
   cd "Rebate Scheme"
   ```
3. **Install the dependencies:**
   ```bash
   npm install
   ```

### Running Locally

To start the development server:

```bash
npm run dev
```

Your app should now be running on [http://localhost:5173](http://localhost:5173).

### Environment Variables

You may need to define local environment variables (`.env`) for complete backend functionality.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Lints the source code using ESLint.
- `npm run preview`: Previews the production build locally.
