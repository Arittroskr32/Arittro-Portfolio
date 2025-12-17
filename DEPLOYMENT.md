# 🚀 Deployment Guide for arittro-sarkar.me

## Server Details
- **IP Address**: 167.71.234.150
- **Domain**: arittro-sarkar.me
- **Server OS**: Ubuntu/Debian (recommended)

---

## 📋 Step 1: Configure DNS (Do this FIRST!)

Point your domain to your server IP:

```
Type    Name                Value               TTL
A       arittro-sarkar.me   167.71.234.150     3600
A       www                 167.71.234.150     3600
```

**Important**: Wait 5-15 minutes for DNS propagation before proceeding!

Verify DNS is working:
```bash
ping arittro-sarkar.me
# Should show 167.71.234.150
```

---

## 📦 Step 2: Server Setup Commands

**On your server (167.71.234.150), run these commands:**

```bash
# 1. Clone the repository
git clone https://github.com/Arittroskr32/Arittro-Portfolio.git
cd Arittro-Portfolio

# 2. Make setup script executable
chmod +x server-setup.sh

# 3. Run automated setup (installs Docker, Nginx, Certbot, SSL)
sudo ./server-setup.sh
```

The script will automatically:
- ✅ Install Docker & Docker Compose
- ✅ Install Nginx
- ✅ Install Certbot
- ✅ Configure firewall
- ✅ Setup Nginx reverse proxy
- ✅ Obtain SSL certificate (HTTPS)

---

## 🔧 Step 3: Start Docker Containers

```bash
# Start all services
docker-compose up -d --build

# Check if all containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

---

## ✅ Step 4: Verify Everything Works

### Check Services:
```bash
# 1. Check Docker containers
docker-compose ps
# All 3 containers should show "Up" status

# 2. Check Nginx
sudo systemctl status nginx
# Should show "active (running)"

# 3. Test backend API
curl https://arittro-sarkar.me/api/health
# Should return: {"status":"OK","message":"Server is running"}

# 4. Check logs
docker-compose logs backend
docker-compose logs frontend
```

### Access Your Site:
- **Frontend**: https://arittro-sarkar.me
- **Admin Panel**: https://arittro-sarkar.me/admin/login
- **API Health**: https://arittro-sarkar.me/api/health

---

## 🔒 Security Checklist

After deployment, verify:

```bash
# 1. Check firewall
sudo ufw status
# Should show: 22/tcp, 80/tcp, 443/tcp ALLOW

# 2. Check SSL certificate
sudo certbot certificates
# Should show valid certificate for arittro-sarkar.me

# 3. Test HTTPS redirect
curl -I http://arittro-sarkar.me
# Should show: HTTP/1.1 301 Moved Permanently
# Location: https://arittro-sarkar.me/

# 4. Check SSL rating
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=arittro-sarkar.me
```

---

## 🔄 Update Application (Future Changes)

```bash
# 1. Stop containers
docker-compose down

# 2. Pull latest code
git pull origin main

# 3. Rebuild and restart
docker-compose up -d --build

# 4. Verify
docker-compose ps
```

---

## 📊 Useful Commands

### Docker Management:
```bash
# View logs (real-time)
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Clean restart (removes volumes)
docker-compose down -v
docker-compose up -d --build
```

### Nginx Management:
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/arittro-sarkar.me.access.log
sudo tail -f /var/log/nginx/arittro-sarkar.me.error.log
```

### SSL Certificate Renewal:
```bash
# Renew SSL certificate (automatic, but can test)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

---

## 💾 Database Backup

```bash
# Create backup
docker exec portfolio-db mysqldump -u devil_32_db -p portfolio_db > backup_$(date +%Y%m%d).sql
# Enter password: Devil_32_datap4ss

# Restore from backup
docker exec -i portfolio-db mysql -u devil_32_db -p portfolio_db < backup_20231217.sql
```

---

## 🐛 Troubleshooting

### Issue: Can't access site
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if Docker containers are running
docker-compose ps

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: SSL certificate error
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: Backend API not responding
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Check if port 8888 is open internally
curl http://localhost:8888/api/health
```

### Issue: Database connection error
```bash
# Check database logs
docker-compose logs database

# Restart database
docker-compose restart database

# Connect to database
docker exec -it portfolio-db mysql -u devil_32_db -p
# Password: Devil_32_datap4ss
```

---

## 📞 Need Help?

Common fixes:
1. **Port conflicts**: Make sure ports 80, 443, 8888, 3306 are not used by other services
2. **DNS not propagated**: Wait longer (up to 24 hours max)
3. **SSL error**: Make sure DNS is pointing to correct IP before running certbot
4. **Docker permission denied**: Run `sudo usermod -aG docker $USER` and logout/login

---

## 🎉 Your Portfolio is Live!

Visit: **https://arittro-sarkar.me**

Admin Login: **https://arittro-sarkar.me/admin/login**
- Email: arittroskr@gmail.com
- Password: arittroskr@gmail.com (Change this immediately!)
