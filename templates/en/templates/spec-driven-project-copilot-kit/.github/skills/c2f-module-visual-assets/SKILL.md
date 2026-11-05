---
name: c2f-module-visual-assets
description: "Mandatory guidelines and canonical prompt for module reference images, covers and thumbnails in Conn2Flow and Conn2Flow Site. Use when creating modules or visual assets."
user-invocable: true
---

# 🎨 Visual Asset Generation and Module Covers (Design System V3.0)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create modules or generate covers, illustrations and thumbnails of Conn2Flow or Conn2Flow Site modules.
- **SKIP ONLY IF**: The task neither creates modules nor generates visual assets.
- **CONSEQUENCE OF IGNORING**: Covers and thumbnails inconsistent with the system design and clippings that hide the main object.

This skill defines the official standard for designing and generating conceptual covers, 3D illustrations and thumbnails for any module of the Conn2Flow ecosystem (Core and Site), ensuring that new modules preserve the same sophistication and aesthetic unity.

---

## 🏛️ 1. Principles of Visual Design System

All illustrations of modules shall comply rigidly with the following pillars:
1. **Visual Language:** Conceptual, stylized and clean 3D isometric.
2. **Materials:** Ground glass (*frosted glass / pearl glass*) and round ceramic with smooth finish.
3. **Canon Color Palette:**
   - **Background:** Deep and continuous midnight blue (*seamless deep middlenight blue*).
   - **Light accents:** Smooth cyan and electric violet on the edges and subtle reflexes.
   - **Support elements:** Light neutral tones in ceramics and vitreous transparency.
4. **Lighting and Camera:**
   - Isometric orthographic camera (without extreme perspective distortion).
   - Smooth studio light coming from the upper left with soft touch shadow on the floor.
5. **Composition and Margins:**
   - The main group of objects must occupy the **70% central** of the image.
   - Leave 15% margin free on all edges to allow miniature cutting and avatars without losing focus.
6. **Inviolable Negative Rules:**
   - **NONE** text, letter, number, logo, watermark, person, face or frame around the image.

---

## 🤖 2. Canon Prompt Template for Image Generators (DALL-E / Midjourney / SD)

When requesting an AI or pipeline to create the image of a new module, use the following template by filling only the fields `{MODULO_ID}` and `{DESCRICAO_DO_OBJETO_3D}`:

```text
Use case: stylized-concept. Asset type: Conn2Flow module cover for {MODULO_ID}, square 1024x1024. 
Style Reference: Cohesive design system for Conn2Flow module covers: deep midnight blue seamless background, cyan and violet luminous accents, pearl frosted glass and soft rounded ceramic materials, orthographic 3D isometric camera, soft studio key light from upper left, subtle luminous edges, gentle ground contact shadow, sophisticated polished product render. 
Center the complete object group inside the middle 70% with generous margins for thumbnail cropping, clean restrained composition, readable as a small thumbnail. 
Subject: {DESCRICAO_DO_OBJETO_3D}. 
Strict constraints: No lettering, no text, no numbers, no logos, no watermarks, no people, no borders.
```

---

## 📐 3. Practical Application Examples

### Example 1: Subscription Module (`subscriptions`)
> **Subject**: *"A floating 3D recurring billing sphere surrounded by a blooming cyan orbital ring with subtle calendar nodes and card token placeholders in frosted glass."*

### Example 2: Automation / Task Module (`admin-cron`)
> **Subject**: *"Three interlocking floating precision ceramic clockwork hearts with an elegant glowing violet pendulum and timeline indicator."*

### Example 3: 3D Catalogue Module (`3d-catalog`)
> **Subject**: *"A glowing holographic display pedestal showing an abstract floating wireless polygon cube rendered in luminous cyan glass."*

---

## 📦 4. Technical Specifications for File Delivery

1. **Format:** `.webp` (Google WebP).
2. **Resolution:** 1024 × 1024 pixels (proportion 1:1).
3. **Maximum Quality and Size:** Quality 90, method 6, **Maximum size of 120 KB** (target: 60 KB to 95 KB).
4. **Canon Path of Storage:**
   - In Core: `gestor/assets/modulos/covers/<modulo-id>.webp`
   - On the Site: `gestor/assets/modulos/covers/<modulo-id>.webp`
   - Module location optional: `gestor/modulos/<modulo-id>/cover.webp`
5. **Manifest Update:**
   - Add the entry with `id`, `width`, `height`, `bytes` and hash `sha256` in the `gestor/assets/modulos/covers/manifest.json` file.
