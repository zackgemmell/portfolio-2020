---
layout: post
category: work
type: Regular
permalink: /raken/athens
published: false

# Home
company: Raken
title: Athens Design System
summary: Defining a new product language and design system for Raken's products.
thumbnail: /images/thumbnails/athens-thumbnail.png
thumbnailDesc: Athens Design System
companyLink: https://rakenapp.com

---

- There were frequent mismatches between what designers were delivering and what developers were actually producing.
- Our web and mobile applications had UI libraries that were almost completely created from scratch because there was very little communication back and forth due to our development teams being primarily off shore at the time.
- Designers were copy-pasting elements from whatever file they remembered seeing them in last which made it a nightmare when new designers came onboard.

It was important that our design system support component states because we wanted to provide more context when stories involved interaction.
It was also important to make sure that our web app is functional on any screen size.
Accessibility was a key consideration because our software is available in 3 different languages, and many of our users utilize dynamic text re-sizing.
Dark and light mode color schemes because iOS 13 had just come out and it seemed like a fun thing to do.
Finally the design system needed to support Web, iOS, Android, and Email while creating a consistent look and feel across all platforms.

## Atomic Design Principles

Inside the component libraries I used the principles of atomic design to ensure that broad changes can be made with minimal effort. It starts by creating the basic core elements which are then used to construct more complex components.
Here you can see the core elements on top.
Below is an input component that is constructed from those core elements, where each column indicates a different state.
In this example we have the default state on the left followed by Focus, Input, Blur, etc.