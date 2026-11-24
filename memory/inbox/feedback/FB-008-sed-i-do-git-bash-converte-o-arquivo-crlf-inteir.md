---
id: "FB-008"
title: "FB-008 — sed -i do Git Bash converte o arquivo CRLF inteiro para LF; Path.write_text no Python Windows faz o inverso"
status: "READY"
verdict: "PENDING"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
repo: "conn2flow-ai-workspace"
request: "REQ-093"
batch: "BATCH-095"
persona: "executor"
skill: "c2f-shell-and-windows-traps"
kind: "learning"
severity: "low"
scope: "global"
recurrence: "3"
evidence: "BATCH-095: printf 'a\\r\\nb\\r\\nc\\r\\n' + sed -i '2s/b/B/' (GNU sed 4.9, /usr/bin/sed) -> od -c mostra a\\n B\\n c\\n; mddHubManager.ts perdeu o CRLF após sed -i; Python 3.14 win32 read_text/write_text gravou CRLF em arquivos LF (os.linesep)"
summary_short: "sed -i do Git Bash converte o arquivo CRLF inteiro para LF; Path.write_text no Python Windows faz o inverso"
github_issue: ""
---

# FB-008 — sed -i do Git Bash converte o arquivo CRLF inteiro para LF; Path.write_text no Python Windows faz o inverso

* **Skill**: `c2f-shell-and-windows-traps` · **Kind**: `learning` · **Severity**: `low` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-093 BATCH-095 (persona `executor`)

## Evidence

BATCH-095: printf 'a\r\nb\r\nc\r\n' + sed -i '2s/b/B/' (GNU sed 4.9, /usr/bin/sed) -> od -c mostra a\n B\n c\n; mddHubManager.ts perdeu o CRLF após sed -i; Python 3.14 win32 read_text/write_text gravou CRLF em arquivos LF (os.linesep)

## Proposal

Na Armadilha 20: edição pontual em arquivo CRLF não usa sed -i do Git Bash; script Python lê/grava bytes ou usa newline='' e confere o EOL pelos bytes depois.
