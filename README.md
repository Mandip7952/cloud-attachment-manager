# Cloud Attachment Manager ☁️

A cloud-based file storage application built with AWS services, designed to provide a web interface for managing digital files.

## 📌 Overview

Cloud Attachment Manager is a cloud computing project that explores how web applications can integrate with cloud infrastructure to support file storage, access, and management.

The application includes a web-based authentication interface and file-management functionality, with AWS services supporting the cloud storage workflow.

## ✨ Features

- **User Authentication** — Sign-in interface for accessing the application.
- **Cloud File Storage** — Integration with AWS cloud storage services.
- **File Management** — Functionality for managing user files.
- **Secure File Downloads** — Support for signed download URLs.
- **Web Interface** — A simple interface for interacting with the storage application.

## 🛠️ Technology Stack

- **Language:** TypeScript
- **Package Manager:** pnpm
- **Cloud Platform:** Amazon Web Services (AWS)
- **Storage:** Amazon S3
- **Compute:** AWS Lambda and Amazon EC2

*Note: Confirm that each listed AWS service is implemented in the current version of the project before publishing.*

## 🏗️ Project Structure

```text
cloud-attachment-manager/
├── artifacts/         # Application components
├── attached_assets/   # Project assets
├── lib/               # Shared libraries
├── scripts/           # Development scripts
├── package.json       # Workspace configuration
├── pnpm-lock.yaml     # Dependency lockfile
└── tsconfig.json      # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- pnpm
- An AWS account, if running the AWS-integrated features
- Appropriate AWS permissions and configuration

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Mandip7952/cloud-attachment-manager.git
   ```

2. Open the project directory:

   ```bash
   cd cloud-attachment-manager
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Configure the required environment variables and AWS resources according to the application configuration.

5. Use the project's configured development workflow to run the application.

**Note:** The exact run command depends on the scripts configured in the individual workspace packages.

## 🔐 Security

- Never commit AWS access keys, secret keys, passwords, or other credentials.
- Store sensitive configuration in environment variables or an appropriate secrets manager.
- Follow the principle of least privilege when configuring AWS permissions.
- Use appropriately scoped, time-limited signed URLs where supported.

## 🎯 Project Goals

- Explore practical cloud computing concepts.
- Understand integration between web applications and AWS services.
- Learn about cloud storage, compute services, and file-access workflows.
- Build hands-on experience with cloud application development.

## 👨‍💻 Author

**Mandip Singh**

GitHub: [@Mandip7952](https://github.com/Mandip7952)

---

*Developed as a cloud computing project for learning and demonstrating AWS-based application development.*
