# Treazury - Cloudflare Pages Deployment Guide

## 📋 Pre-requisitos

- Cuenta en Cloudflare
- Repositorio GitHub conectado
- Node.js 18+ (para build local)
- Bun o npm instalado

## 🚀 Deployment Rápido

### Opción 1: Deploy desde CLI

```bash
# 1. Login en Cloudflare
bun run deploy:login

# 2. Build del proyecto
bun run build:deploy

# 3. Deploy a Cloudflare Pages
bun run deploy
```

### Opción 2: Deploy desde Cloudflare Dashboard

1. Ve a [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click en **"Create a project"**
3. Conecta tu repositorio GitHub: `cxto21/treazury`
4. Configuración de build:
   - **Framework preset**: Vite
   - **Build command**: `bun run build:web` o `npm run build:web`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (raíz del proyecto)

## ⚙️ Variables de Entorno en Cloudflare

Ve a: **Settings → Environment variables** y agrega:

### Variables Requeridas

```bash
# Network
STARKNET_RPC=https://ztarknet-madara.d.karnot.xyz
NETWORK=ztarknet-testnet

# TreazuryVault v2.0
TREAZURY_VAULT_ADDRESS=0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196
TREAZURY_VAULT_OWNER=0x5b7213d74268643e884c026569b800f463fd9f5b86493fb2551c38507f045fa
```

### Variables Opcionales

```bash
# ZK Passport (si se usa)
ZKPASSPORT_CONTRACT=

# API Keys (si se usan)
API_KEY=
GEMINI_API_KEY=
```

## 🔧 Build Local (Desarrollo)

```bash
# Instalar dependencias
bun install

# Desarrollo local
bun run dev:web

# Build de producción
bun run build:web

# Preview del build
bun run preview
```

## 📦 Estructura del Build

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── _redirects (opcional)
```

## 🌍 Dominios Personalizados

1. En Cloudflare Pages, ve a **Custom domains**
2. Click en **"Set up a custom domain"**
3. Agrega tu dominio (ejemplo: `treazury.app`)
4. Cloudflare configurará automáticamente SSL/TLS

## 🔒 Security Headers (Recomendado)

Crea un archivo `public/_headers` con:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://ztarknet-madara.d.karnot.xyz https://*.starkscan.co;
```

## 📊 Monitoreo y Analytics

Cloudflare Pages incluye:
- **Web Analytics**: Automático (sin cookies)
- **Real User Monitoring**: Gratis
- **Build logs**: Para debugging

Accede en: **Analytics → Web Analytics**

## 🔄 CI/CD Automático

Cloudflare Pages se integra con GitHub:

- ✅ **Push a `main`** → Deploy automático a producción
- ✅ **Pull Requests** → Preview deployments automáticos
- ✅ **Rollback** → Un click para versiones anteriores

## 🐛 Troubleshooting

### Build falla

```bash
# Verifica que compile localmente primero
bun run build:web

# Revisa los logs en Cloudflare Dashboard
# Settings → Builds & Deployments → View logs
```

### Error de variables de entorno

- Verifica que todas las variables estén configuradas en Cloudflare
- Re-deploya después de agregar variables

### Error de RPC

- Verifica que `STARKNET_RPC` esté correctamente configurado
- Prueba con un RPC alternativo si el de Ztarknet está caído

## 📝 Comandos Útiles

```bash
# Ver logs de Cloudflare
npx wrangler pages deployment list

# Deploy específico
npx wrangler pages deploy dist --project-name=treazury

# Ver configuración
npx wrangler pages project list
```

## 🔗 URLs de Deployment

Después del deployment, tendrás:

- **Production**: `https://treazury.pages.dev`
- **Preview** (PR): `https://[commit-hash].treazury.pages.dev`

## ⚡ Performance Optimizations

Cloudflare Pages incluye automáticamente:

- ✅ CDN global (300+ ubicaciones)
- ✅ HTTP/3 y QUIC
- ✅ Brotli compression
- ✅ Minificación automática
- ✅ Image optimization (con Cloudflare Images)

## 📚 Documentación Adicional

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [TreazuryVault Contract Docs](./SECURITY_FIXES_IMPLEMENTED.md)

## 🎯 Próximos Pasos

1. ✅ Deploy inicial a Cloudflare Pages
2. ⏳ Configurar dominio personalizado
3. ⏳ Agregar analytics y monitoreo
4. ⏳ Setup de CI/CD completo
5. ⏳ Optimizaciones de performance

---

**Status**: ✅ Ready for deployment  
**Last Updated**: December 4, 2025  
**Contract Version**: TreazuryVault v2.0 (SECURE)
