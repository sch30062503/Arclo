#!/bin/bash
# Arclo build script — injects Supabase env vars into auth.js

echo "Building Arclo..."

# Check env vars exist
if [ -z "$SUPABASE_URL" ]; then
  echo "Error: SUPABASE_URL is not set"
  exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Error: SUPABASE_ANON_KEY is not set"
  exit 1
fi

# Inject env vars into auth.js
sed -i "s|__SUPABASE_URL__|$SUPABASE_URL|g" js/auth.js
sed -i "s|__SUPABASE_ANON_KEY__|$SUPABASE_ANON_KEY|g" js/auth.js

echo "Build complete — Supabase connected."
