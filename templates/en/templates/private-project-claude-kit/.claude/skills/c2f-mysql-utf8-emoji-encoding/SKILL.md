---
name: c2f-mysql-utf8-emoji-encoding
description: "READ BEFORE saving text, posts, JSON or strings containing emoji or special Unicode characters in MySQL. Prevents rejected updates and missing persisted values."
user-invocable: false
---

# JSON Safe for 3 bytes MySQL utf8

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Record rich textual data, social media posts, user feedback or arbitrary JSONs in MySQL columns.
- **SKIP ONLY IF**: Strictly numerical columns, booleans or controlled ASCII slugs.
- **CONSEQUENCE OF IGNORING**: Silent write failure in MySQL (`Incorrect string value`), unrecoverable loss of user-typed content and persisted fields like NULL.

---

- While the connection uses `mysqli_set_charset(..., "utf8")`, treat 4-byte characters as incompatible with direct recording.
- Code JSON payloads with `json_encode($dados, JSON_UNESCAPED_SLASHES)`.
- Do not add `JSON_UNESCAPED_UNICODE`: `\uXXXX` exhausts maintain the ASCII-safe and `json_decode` value restores Unicode/emoji in reading.
- Check error/affected lines after INSERT/UPDATE; legacy helpers can fail silently.
- If migration exists but the column remains null, investigate charset before concluding that the persistence path did not run.
- If project migrates fully to `utf8mb4`, re-evaluate this compatibility before removing the pattern.
