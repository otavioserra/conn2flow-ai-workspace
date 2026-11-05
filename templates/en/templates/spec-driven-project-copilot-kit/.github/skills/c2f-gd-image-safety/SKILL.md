---
name: c2f-gd-image-safety
description: "READ BEFORE resizing, converting or generating thumbnails with PHP GD. Prevents fatal errors from unsupported WebP/AVIF formats, memory exhaustion and corrupted uploads."
user-invocable: false
---

# GD Image Security

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Manipulate upload, resize, crop or image conversion using the PHP GD extension.
- **SKIP ONLY IF**: Upload non-image binary files (PDFs, videos, audios) treated as pure static files.
- **CONSEQUENCE OF IGNORING**: Fatal Uncaptured Errors (`\Throwable`) on servers without native support to specific formats (WebP/AVIF) and corruption of user images.

---

- Before processing a format, confirm `function_exists` for both the read and write function.
- Do not assume WebP/AVIF support from the presence of the GD extension; validate specific functions or `gd_info()`.
- Capture `\Throwable`, not only `\Exception`: missing GD function launches `\Error` and can cause HTTP 500.
- If the server cannot generate thumbnail, safely degrade to the original file when the browser supports it.
- Validate input, output and destruction of resources; never record partial file on the original.
- Explicitly test a runtime without optional format support.
