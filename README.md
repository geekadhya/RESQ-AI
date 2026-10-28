
# 🚨 RESQ AI
### AI-Powered Emergency Response & Incident Management Platform

<p align="center">
  <strong>Faster Reporting. Smarter Coordination. Safer Communities.</strong>
</p>

<p align="center">
  A technology-driven emergency response platform designed to help communities
  report, monitor, and manage incidents, with a focus on rural and underserved areas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-orange?style=for-the-badge" alt="Project Status" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

---

## 📌 Overview

In emergencies, delayed reporting and fragmented communication can make it harder to coordinate an effective response. These challenges can be especially significant in rural areas, where access to emergency services and reliable infrastructure may be limited.

**RESQ AI** is an emergency incident management platform being developed to streamline incident reporting, centralize incident records, and provide a unified dashboard for monitoring response status.

The current implementation provides a dashboard and a database-backed incident management API. The long-term vision is to extend the platform with AI-assisted prioritization, location intelligence, and improved emergency coordination.

> **Our vision:** Make emergency information easier to report, understand, and act upon.

## 🎯 Problem Statement

Emergency response workflows can face several challenges:

- 📍 Incomplete or inaccurate incident location information.
- ⏱️ Delays between incident reporting and response coordination.
- 📊 Limited visibility into incident severity and status.
- 🔄 Fragmented incident records and manual tracking.
- 🌐 Additional accessibility challenges in rural and underserved communities.

RESQ AI aims to address these challenges through a centralized, extensible digital platform.

## ✨ Current Features

- 📊 **Emergency Dashboard** — View incident statistics and incident records in one place.
- 🚨 **Incident Reporting** — Submit incidents with a type, location, and severity.
- 🗃️ **Persistent Storage** — Store incident records in MongoDB.
- 🔄 **Status Management** — Update incident statuses and retain changes in the database.
- 🔎 **Search and Filters** — Find incidents using search, severity, and status filters.
- ⚡ **REST API** — Communicate between the React frontend and Express backend.
- 🛡️ **Input Validation** — Validate required incident fields and supported severity/status values.
- 📱 **Responsive Interface** — Use a dashboard designed to adapt to different screen sizes.

## 🖥️ Dashboard Preview

<!-- Add a real screenshot after capturing your running dashboard. -->
<!-- Save it as docs/images/dashboard.png and uncomment the next line. -->

 ![RESQ AI Dashboard](docs/images/dashboard.png) 

*Screenshot coming soon.*

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js |
| API Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Configuration | dotenv |
| Version Control | Git and GitHub |

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│       React Dashboard        │
│                              │
│ Reporting • Search • Filters │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│       Express REST API       │
│                              │
│ Validation • Incident Routes │
└──────────────┬───────────────┘
               │ Mongoose
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│                              │
│ Persistent Incident Records  │
└──────────────────────────────┘
```

### Incident Lifecycle

```text
Reported → Dispatched → Responding → Resolved
```

The application currently supports incident creation, retrieval, and status updates. This lifecycle represents incident tracking in the application; it does not imply that real emergency services are automatically dispatched.

## 📂 Project Structure

The main application structure is organized as follows. Exact frontend filenames may vary with your implementation.

```text
RESQ-AI/
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Incident.js
│   ├── routes/
│   │   └── incidents.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## ⚙️ Getting Started

Follow these instructions to run RESQ AI locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — preferably an active LTS release.
- npm — included with Node.js.
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance.
- [Git](https://git-scm.com/).

### 1. Clone the Repository

```bash
git clone https://github.com/geekadhya/RESQ-AI.git
cd RESQ-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with your own MongoDB connection string.

**Security:** Never commit `.env` or expose database credentials in source code, screenshots, logs, or public issues.

### 4. Start the Backend

Open a terminal in the project root:

```bash
npm run server
```

The backend should connect to MongoDB before accepting requests. Check the terminal for the database connection message.

### 5. Start the Frontend

Open a second terminal in the project root:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

The API is configured to run at:

```text
http://localhost:5000/api
```

> If your `package.json` uses different script names or ports, follow the actual project configuration.

## 🔌 API Documentation

The current incident API is mounted at `/api/incidents`.

Base URL:

```text
http://localhost:5000/api/incidents
```

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/incidents` | Retrieve incident records |
| GET | `/api/incidents/:id` | Retrieve an incident by ID |
| POST | `/api/incidents` | Create an incident |
| PATCH | `/api/incidents/:id/status` | Update an incident's status |

### Create an Incident

**Request**

```http
POST /api/incidents
Content-Type: application/json
```

```json
{
  "type": "Road Accident",
  "location": "Village Main Road",
  "severity": "Critical"
}
```

Supported severity values:

- `Critical`
- `High`
- `Medium`
- `Low`

Supported status values:

- `Reported`
- `Dispatched`
- `Responding`
- `Resolved`

New incidents default to `Reported`.

### Update Incident Status

**Request**

```http
PATCH /api/incidents/INCIDENT_ID/status
Content-Type: application/json
```

```json
{
  "status": "Resolved"
}
```

Replace `INCIDENT_ID` with the actual MongoDB document ID.

The API implementation should be treated as the source of truth for response formats and error behavior.

## 🗺️ Roadmap

RESQ AI is under active development. The following are planned improvements, not claims of completed functionality.

- [ ] Interactive incident map and geolocation support.
- [ ] AI-assisted incident classification and prioritization.
- [ ] Real-time dashboard updates.
- [ ] Incident history and analytics.
- [ ] Authentication and role-based access control.
- [ ] Secure integration workflows for authorized emergency partners.
- [ ] Rural connectivity and low-bandwidth improvements.
- [ ] Testing, monitoring, and deployment hardening.

Real-world dispatch, ambulance or police integrations, and AI-based triage will require validation, appropriate safeguards, and coordination with authorized service providers.

## 🔐 Security and Privacy

Emergency-related information can be sensitive. Security is an essential part of the project.

- Keep credentials and API keys in environment variables.
- Never commit `.env` files.
- Validate and sanitize user-controlled input.
- Add authentication and authorization before exposing sensitive operations publicly.
- Use HTTPS and appropriate access controls in production.
- Avoid storing unnecessary personal or medical information.
- Test error handling, rate limiting, and database access controls before deployment.

**Important:** This project is a development prototype, not a certified emergency dispatch system. Do not rely on it as a replacement for official emergency services.

## 🧪 Testing

Before contributing or deploying, verify:

- [ ] The backend starts and connects to MongoDB.
- [ ] Incident records load in the dashboard.
- [ ] Creating an incident persists after a page refresh.
- [ ] Status changes persist after a page refresh.
- [ ] Search and filters return the expected results.
- [ ] Invalid input and missing fields are handled correctly.
- [ ] API failures are displayed clearly in the UI.

Automated test coverage can be added as the project evolves.

## 🤝 Contributing

Contributions, suggestions, bug reports, and ideas are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Test your changes locally.
5. Commit with a descriptive message.
6. Open a pull request explaining the change.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Please do not include credentials, private user data, or other secrets in commits or issues.

## 🌱 Project Philosophy

RESQ AI is being built around three principles:

- **Speed:** Reduce friction in reporting and tracking incidents.
- **Clarity:** Make incident information and status easier to understand.
- **Accessibility:** Design with rural and underserved communities in mind.

## 👥 Team

Built collaboratively by the RESQ AI project team.

- **Repository:** [geekadhya/RESQ-AI](https://github.com/geekadhya/RESQ-AI)
- **Current development branch:** `feature/resqai-backend`

## 📄 License

No license has been specified here yet. Add a `LICENSE` file before presenting the project as open source, and choose a license appropriate for your goals.

---

<p align="center">
  <strong>RESQ AI — Building toward faster, smarter emergency coordination.</strong>
</p>
