#!/bin/bash

# Server Setup Script for arittro-sarkar.me
# Run this script on your server after cloning the repository

set -e

echo "🚀 Setting up Portfolio on arittro-sarkar.me"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Update system
echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
echo -e "${YELLOW}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# 3. Install Docker Compose
echo -e "${YELLOW}[3/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo apt install docker-compose-plugin -y
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# 4. Install Nginx
echo -e "${YELLOW}[4/8] Installing Nginx...${NC}"
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
echo -e "${GREEN}✓ Nginx installed and started${NC}"

# 5. Install Certbot for SSL
echo -e "${YELLOW}[5/8] Installing Certbot for SSL...${NC}"
sudo apt install certbot python3-certbot-nginx -y
echo -e "${GREEN}✓ Certbot installed${NC}"

# 6. Configure Firewall
echo -e "${YELLOW}[6/8] Configuring firewall...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"

# 7. Setup Nginx configuration
echo -e "${YELLOW}[7/8] Setting up Nginx configuration...${NC}"
sudo cp nginx-host.conf /etc/nginx/sites-available/arittro-sarkar.me

# Create symlink
if [ -f /etc/nginx/sites-enabled/arittro-sarkar.me ]; then
    sudo rm /etc/nginx/sites-enabled/arittro-sarkar.me
fi
sudo ln -s /etc/nginx/sites-available/arittro-sarkar.me /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

echo -e "${GREEN}✓ Nginx configured${NC}"

# 8. Get SSL Certificate
echo -e "${YELLOW}[8/8] Obtaining SSL certificate...${NC}"
echo -e "${YELLOW}Make sure your domain DNS is pointing to this server IP!${NC}"
read -p "Press Enter to continue with SSL setup or Ctrl+C to cancel..."

sudo certbot --nginx -d arittro-sarkar.me -d www.arittro-sarkar.me --non-interactive --agree-tos --email arittroskr@gmail.com

echo -e "${GREEN}✓ SSL certificate obtained${NC}"

# Reload Nginx
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}=============================================="
echo -e "✅ Server setup complete!"
echo -e "=============================================="
echo ""
echo "Next steps:"
echo "1. Update .env file with your domain:"
echo "   nano .env"
echo ""
echo "2. Start Docker containers:"
echo "   docker-compose up -d --build"
echo ""
echo "3. Check if containers are running:"
echo "   docker-compose ps"
echo ""
echo "4. Your site will be available at:"
echo "   https://arittro-sarkar.me"
echo ""
echo "5. Admin panel:"
echo "   https://arittro-sarkar.me/admin/login"
echo -e "${NC}"
