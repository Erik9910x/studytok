# Groq Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real Groq AI study-pack generation through a server-side proxy.

**Architecture:** Keep the frontend as a polished interactive client. Add a Next.js route handler that validates input, rotates server-side Groq keys, requests strict JSON, and returns `StudyPack` data.

**Tech Stack:** Next.js route handlers, TypeScript, Groq OpenAI-compatible chat completions API, React state.

---

## Tasks

- [ ] Add env examples and gitignore for secrets.
- [ ] Add Groq proxy route and schema validation helpers.
- [ ] Update frontend to call `/api/study-pack` with loading/error state.
- [ ] Verify typecheck and production build.
