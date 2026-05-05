export interface Category {
  id: string
  title: string
  description: string
  icon: string
  articleCount: number
  slug: string
}

export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  categorySlug: string
  author: string
  date: string
  readTime: string
  roles: string[]
  slug: string
}

export const categories: Category[] = [
  {
    id: "1",
    title: "Getting Started",
    description: "Learn the basics and set up your account quickly",
    icon: "rocket",
    articleCount: 12,
    slug: "getting-started"
  },
  {
    id: "2",
    title: "Account & Billing",
    description: "Manage your subscription, payments, and account settings",
    icon: "credit-card",
    articleCount: 8,
    slug: "account-billing"
  },
  {
    id: "3",
    title: "Integrations",
    description: "Connect with your favorite tools and services",
    icon: "plug",
    articleCount: 15,
    slug: "integrations"
  },
  {
    id: "4",
    title: "API Reference",
    description: "Technical documentation for developers",
    icon: "code",
    articleCount: 24,
    slug: "api-reference"
  },
  {
    id: "5",
    title: "Security & Privacy",
    description: "Keep your data safe and understand our policies",
    icon: "shield",
    articleCount: 6,
    slug: "security-privacy"
  },
  {
    id: "6",
    title: "Best Practices",
    description: "Tips and strategies for getting the most out of our platform",
    icon: "lightbulb",
    articleCount: 18,
    slug: "best-practices"
  }
]

export const articles: Article[] = [
  {
    id: "1",
    title: "How to Create Your First Project",
    excerpt: "A step-by-step guide to setting up your first project and configuring the essential settings for success.",
    content: `
## Introduction

Creating your first project is an exciting step in your journey with our platform. This guide will walk you through the entire process, from initial setup to launching your project.

## Prerequisites

Before you begin, make sure you have:

- An active account with verified email
- Basic understanding of the platform interface
- Clear goals for your project

## Step 1: Access the Dashboard

Navigate to your dashboard by clicking on the "Dashboard" link in the main navigation. You'll see an overview of your account and a prominent "New Project" button.

## Step 2: Configure Basic Settings

Click "New Project" and you'll be presented with a configuration wizard. Here you'll need to:

1. Enter a project name
2. Select a project type
3. Choose your preferred settings

## Step 3: Set Up Team Access

If you're working with a team, now is the time to invite collaborators. Go to the "Team" tab and enter the email addresses of your team members.

## Step 4: Launch Your Project

Once everything is configured, click the "Launch" button. Your project will be created and you'll be redirected to the project dashboard.

## Next Steps

Now that your project is live, consider exploring:

- Advanced configuration options
- Integration possibilities
- Analytics and reporting features

## Conclusion

Congratulations! You've successfully created your first project. If you have any questions, don't hesitate to reach out to our support team.
    `,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    category: "Getting Started",
    categorySlug: "getting-started",
    author: "Sarah Chen",
    date: "2024-01-15",
    readTime: "5 min read",
    roles: ["Admin", "User"],
    slug: "how-to-create-your-first-project"
  },
  {
    id: "2",
    title: "Understanding User Permissions",
    excerpt: "Learn about the different permission levels and how to manage access for your team members effectively.",
    content: `
## Overview

User permissions are a crucial part of maintaining security and organization within your projects. This article explains the different permission levels available.

## Permission Levels

### Admin
Admins have full access to all features and settings. They can:
- Manage team members
- Configure billing
- Delete projects

### Editor
Editors can modify content but cannot change settings:
- Create and edit content
- Publish changes
- View analytics

### Viewer
Viewers have read-only access:
- View published content
- Access reports
- Cannot make changes

## Best Practices

1. Follow the principle of least privilege
2. Regularly audit permissions
3. Document your permission structure

## Managing Permissions

To change a user's permissions, navigate to Settings > Team > Members and click on the user you want to modify.
    `,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    category: "Getting Started",
    categorySlug: "getting-started",
    author: "Michael Torres",
    date: "2024-01-12",
    readTime: "4 min read",
    roles: ["Admin"],
    slug: "understanding-user-permissions"
  },
  {
    id: "3",
    title: "Connecting Your Payment Method",
    excerpt: "Step-by-step instructions for adding and managing payment methods in your account.",
    content: `
## Adding a Payment Method

To add a payment method to your account, follow these steps:

## Supported Payment Methods

We accept the following payment methods:
- Credit cards (Visa, Mastercard, American Express)
- Debit cards
- PayPal
- Bank transfers (for enterprise plans)

## Step-by-Step Guide

### Step 1: Access Billing Settings
Navigate to Settings > Billing in your dashboard.

### Step 2: Add Payment Method
Click "Add Payment Method" and select your preferred option.

### Step 3: Enter Details
Fill in the required information and verify your payment method.

## Security

All payment information is encrypted and stored securely. We never store your full card number on our servers.
    `,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
    category: "Account & Billing",
    categorySlug: "account-billing",
    author: "Emily Watson",
    date: "2024-01-10",
    readTime: "3 min read",
    roles: ["Admin"],
    slug: "connecting-your-payment-method"
  },
  {
    id: "4",
    title: "Slack Integration Setup",
    excerpt: "Connect your workspace with Slack to receive real-time notifications and updates.",
    content: `
## Why Integrate with Slack?

Slack integration allows you to:
- Receive real-time notifications
- Share updates with your team
- Trigger actions from Slack

## Prerequisites

- A Slack workspace where you have admin access
- An active account on our platform

## Installation Steps

### Step 1: Access Integrations
Go to Settings > Integrations and find Slack in the list.

### Step 2: Authorize
Click "Connect" and authorize our app in your Slack workspace.

### Step 3: Configure Channels
Select which channels should receive notifications.

## Available Commands

Once connected, you can use these slash commands:
- /status - Check project status
- /notify - Send a notification
- /help - Get help

## Troubleshooting

If you're having issues, try disconnecting and reconnecting the integration.
    `,
    image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=400&fit=crop",
    category: "Integrations",
    categorySlug: "integrations",
    author: "David Kim",
    date: "2024-01-08",
    readTime: "6 min read",
    roles: ["Admin", "User"],
    slug: "slack-integration-setup"
  },
  {
    id: "5",
    title: "REST API Authentication",
    excerpt: "Learn how to authenticate your API requests using API keys and OAuth tokens.",
    content: `
## Authentication Methods

Our API supports two authentication methods:

## API Keys

API keys are the simplest way to authenticate:

### Generating an API Key
1. Go to Settings > API
2. Click "Generate New Key"
3. Copy and store your key securely

### Using API Keys
Include your API key in the header:
\`\`\`
Authorization: Bearer your_api_key_here
\`\`\`

## OAuth 2.0

For user-based authentication, use OAuth 2.0:

### Authorization Flow
1. Redirect users to our authorization endpoint
2. User grants permission
3. Receive an authorization code
4. Exchange for access token

## Rate Limits

- API Keys: 1000 requests/hour
- OAuth: 5000 requests/hour

## Security Best Practices

- Never expose API keys in client-side code
- Rotate keys regularly
- Use environment variables
    `,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
    category: "API Reference",
    categorySlug: "api-reference",
    author: "Alex Johnson",
    date: "2024-01-05",
    readTime: "8 min read",
    roles: ["Admin"],
    slug: "rest-api-authentication"
  },
  {
    id: "6",
    title: "Two-Factor Authentication Guide",
    excerpt: "Enhance your account security by enabling two-factor authentication (2FA).",
    content: `
## What is 2FA?

Two-factor authentication adds an extra layer of security to your account by requiring a second form of verification.

## Supported Methods

- Authenticator apps (Google Authenticator, Authy)
- SMS verification
- Hardware security keys

## Setting Up 2FA

### Step 1: Access Security Settings
Navigate to Settings > Security > Two-Factor Authentication.

### Step 2: Choose Your Method
Select your preferred 2FA method.

### Step 3: Verify
Follow the prompts to complete setup.

## Recovery Codes

When you enable 2FA, you'll receive recovery codes. Store these securely - they're your backup if you lose access to your 2FA device.

## Best Practices

- Use an authenticator app over SMS when possible
- Keep recovery codes in a secure location
- Consider enabling 2FA for all team members
    `,
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=400&fit=crop",
    category: "Security & Privacy",
    categorySlug: "security-privacy",
    author: "Rachel Green",
    date: "2024-01-03",
    readTime: "4 min read",
    roles: ["Admin", "User", "Guest"],
    slug: "two-factor-authentication-guide"
  },
  {
    id: "7",
    title: "Optimizing Your Workflow",
    excerpt: "Discover tips and tricks to streamline your workflow and boost productivity.",
    content: `
## Introduction

Efficiency is key to getting the most out of our platform. Here are proven strategies to optimize your workflow.

## Keyboard Shortcuts

Master these shortcuts to work faster:
- Cmd/Ctrl + K: Quick search
- Cmd/Ctrl + N: New item
- Cmd/Ctrl + S: Save
- Cmd/Ctrl + /: Toggle sidebar

## Templates

Create templates for recurring tasks:

### Creating a Template
1. Set up your ideal configuration
2. Click "Save as Template"
3. Name and categorize your template

## Automation

Set up automations to handle repetitive tasks:
- Scheduled reports
- Auto-assignment rules
- Status updates

## Team Collaboration

### Real-time Editing
Multiple team members can work on the same project simultaneously.

### Comments and Mentions
Use @mentions to notify specific team members.

## Conclusion

Implementing these practices will significantly improve your productivity.
    `,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
    category: "Best Practices",
    categorySlug: "best-practices",
    author: "James Miller",
    date: "2024-01-01",
    readTime: "7 min read",
    roles: ["Admin", "User"],
    slug: "optimizing-your-workflow"
  },
  {
    id: "8",
    title: "GitHub Integration Guide",
    excerpt: "Connect your repositories and automate your development workflow with GitHub integration.",
    content: `
## Overview

Our GitHub integration allows you to connect your repositories and automate workflows.

## Features

- Automatic deployments
- Pull request previews
- Issue synchronization
- Commit tracking

## Setup

### Step 1: Connect GitHub
Go to Settings > Integrations > GitHub and click "Connect".

### Step 2: Select Repositories
Choose which repositories to connect.

### Step 3: Configure Webhooks
Set up webhooks for the events you want to track.

## Deployment Configuration

Create a deployment configuration file in your repository root to customize deployments.

## Troubleshooting

Common issues and solutions for GitHub integration.
    `,
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=400&fit=crop",
    category: "Integrations",
    categorySlug: "integrations",
    author: "Chris Anderson",
    date: "2023-12-28",
    readTime: "5 min read",
    roles: ["Admin"],
    slug: "github-integration-guide"
  }
]

export const roles = ["Admin", "User", "Guest"]

export function getArticlesByCategory(categorySlug: string): Article[] {
  return articles.filter(article => article.categorySlug === categorySlug)
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(article => article.slug === slug)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(category => category.slug === slug)
}

export function getRelatedArticles(currentSlug: string, categorySlug: string, limit = 3): Article[] {
  return articles
    .filter(article => article.slug !== currentSlug && article.categorySlug === categorySlug)
    .slice(0, limit)
}
