# Portfolio Docker Commands

## Build & Run

### Start All Services (Main)
```bash
docker-compose up -d --build
```




### Start Frontend Only
```bash
docker-compose up -d --build frontend
```

### Start Backend Only
```bash
docker-compose up -d --build backend
```

---

## Stop Services

### Stop All Services (Main)
```bash
docker-compose down
```

### Stop Frontend Only
```bash
docker-compose stop frontend
```

### Stop Backend Only
```bash
docker-compose stop backend
```

---

## Check Logs

### Check All Logs (Main)
```bash
docker-compose logs -f
```

### Check Frontend Logs
```bash
docker logs portfolio-frontend -f
```

### Check Backend Logs
```bash
docker logs portfolio-backend -f
```

### Check Database Logs
```bash
docker logs portfolio-db -f
```

---

## Quick Reference

- **Build without cache:** `docker-compose build --no-cache`
- **Remove all containers:** `docker-compose down -v`
- **Restart services:** `docker-compose restart`
- **View running containers:** `docker ps`
