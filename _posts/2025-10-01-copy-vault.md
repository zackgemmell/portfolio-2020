---
layout: post
category: personal
type: Regular
permalink: /copy-vault/
published: true

# Home
company: Personal
title: Copy Vault
summary: Lightweight clipboard history app
thumbnail: /images/thumbnails/cv-thumbnail.png
thumbnailDesc: Copy Vault
companyLink: https://appstoreconnect

---

## Overview

Copy Vault is a lightweight clipboard history manager I built to explore the latest macOS and iOS developer features. The app runs natively on both platforms, capturing every clipboard item and providing quick access to your copy history.

**The app is coming soon to the App Store.**

![Guardrails and safety features]({{site.url}}/assets/img/copyvault/app.png){: .post-image .img-120 .mt .zoom-image }

## Motivation

I wanted to get hands-on experience with the new developer tools and APIs introduced in the latest macOS and iOS releases, particularly the liquid glass design system. Rather than just reading documentation, I decided to build something practical that I'd actually use daily—a clipboard manager that feels native to both platforms.

## What It Does

Copy Vault sits quietly in the background, monitoring your system clipboard. Every time you copy something—text, links, images—it gets saved to your history. When you need to paste something from earlier, you can quickly pull up your history and select any previous item.

**Key Features:**
- Automatic clipboard monitoring across macOS and iOS
- Persistent history that syncs between devices
- Search and filter through past clipboard items
- Native UI using liquid glass design language
- Lightweight and fast—minimal system resource usage
- Privacy-focused: all data stays local on your devices

## Technical Highlights

Built using SwiftUI and the new liquid glass APIs, Copy Vault leverages:
- **Unified Codebase**: Shared logic between macOS and iOS with platform-specific UI adaptations
- **Clipboard Monitoring**: Real-time tracking using modern pasteboard APIs
- **Data Persistence**: CoreData for efficient local storage
- **Modern Design**: Liquid glass effects for a polished, native feel

The project was an excellent way to learn the nuances of building truly universal apps that feel at home on each platform while sharing the majority of their codebase.

## Learnings

Building Copy Vault taught me a lot about:
- Working with the new liquid glass visual effects system
- Managing permissions and privacy considerations for clipboard access
- Optimizing background monitoring without draining battery
- Creating intuitive UI patterns that work across different screen sizes

## Outcome

Copy Vault successfully demonstrates the power of modern Apple development tools. The app runs smoothly on both platforms and has become part of my daily workflow. More importantly, it gave me practical experience with the latest APIs that I can apply to future projects.
