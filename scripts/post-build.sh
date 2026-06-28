#!/bin/bash
set -e

# Push database schema (creates tables if they don't exist)
pnpm --filter @workspace/db push

# Prune pnpm store to reduce deployment size
pnpm store prune
