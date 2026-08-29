# ── Stage 1: install production dependencies ──────────────────────────────────
# node:slim = Debian-based (glibc) — required for sharp's prebuilt binaries.
# Alpine (musl) would need a full recompile of sharp/vips.
FROM node:22-slim AS deps

WORKDIR /app

# Copy manifests first for layer caching — only re-runs npm ci when these change
COPY package.json package-lock.json ./

# Reproducible install, skip devDependencies (nodemon etc.)
# --ignore-scripts=false lets sharp download its prebuilt linux-x64-glibc binary
RUN npm ci --omit=dev --ignore-scripts=false

# ── Stage 2: production runner ─────────────────────────────────────────────────
FROM node:22-slim AS runner

# Harden runtime environment
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Non-root user — reduces attack surface on the GCP VM
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nodeuser

# Copy production node_modules from deps stage (no dev tools)
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application source and package manifest
COPY --chown=nodeuser:nodejs src/         ./src/
COPY --chown=nodeuser:nodejs package.json ./

USER nodeuser

# Document the default port; override with -e PORT=XXXX at runtime
EXPOSE 3000

# Health check using the /health endpoint already in app.js
# --start-period gives Node time to connect to Redis/Supabase on cold start
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e \
    "fetch('http://localhost:'+process.env.PORT+'/health')\
      .then(r=>process.exit(r.ok?0:1))\
      .catch(()=>process.exit(1))"

# Run directly with node — no shell wrapper, forwards SIGTERM cleanly
CMD ["node", "src/app.js"]
