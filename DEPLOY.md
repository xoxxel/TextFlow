# 🐳 راهنمای Deploy با Docker

## روش 1: CapRover (ساده‌ترین!)

### پیش‌نیاز
- یک سرور با CapRover نصب شده
- Git repository

### مراحل:
1. وارد پنل CapRover شوید
2. یک App جدید بسازید (مثلاً: `humanize-api`)
3. در تنظیمات App، پورت را روی `3000` تنظیم کنید
4. از طریق CLI یا Git، پروژه را push کنید:

```bash
# نصب CapRover CLI
npm install -g caprover

# اتصال به سرور
caprover login

# Deploy کردن
caprover deploy
```

یا با Git:
```bash
git remote add caprover https://captain.your-domain.com/
git push caprover master
```

**تمام!** CapRover خودکار build و deploy می‌کند.

---

## روش 2: Docker مستقیم

### 1. ساخت Image
```bash
docker build -t humanize-text-api .
```

### 2. اجرای Container
```bash
docker run -d -p 3000:3000 --name humanize-api humanize-text-api
```

### 3. مشاهده لاگ‌ها
```bash
docker logs humanize-api
```

### 4. توقف Container
```bash
docker stop humanize-api
docker rm humanize-api
```

---

## روش 2: Docker Compose (توصیه می‌شود)

### اجرا
```bash
docker-compose up -d
```

### مشاهده لاگ‌ها
```bash
docker-compose logs -f
```

### توقف
```bash
docker-compose down
```

### راه‌اندازی مجدد
```bash
docker-compose restart
```

---

## 🚀 Deploy روی سرور

### 1. کپی فایل‌ها به سرور
```bash
scp -r . user@your-server:/path/to/app
```

### 2. اتصال به سرور
```bash
ssh user@your-server
cd /path/to/app
```

### 3. اجرا با Docker Compose
```bash
docker-compose up -d
```

---

## 🔧 تنظیمات پورت

اگر می‌خواید روی پورت دیگری اجرا کنید:

```bash
docker run -d -p 8080:3000 --name humanize-api humanize-text-api
```

یا در `docker-compose.yml` تغییر دهید:
```yaml
ports:
  - "8080:3000"
```

---

## 📊 دسترسی به API

بعد از اجرا، API در دسترس است:
```
http://your-server-ip:3000/api/dictionary
```

---

## 🔒 نکات امنیتی

### 1. استفاده از Nginx به عنوان Reverse Proxy
```bash
sudo apt install nginx
```

فایل کانفیگ Nginx (`/etc/nginx/sites-available/humanize`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. فعال کردن HTTPS با Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔄 به‌روزرسانی

```bash
docker-compose pull
docker-compose up -d
```

یا:

```bash
docker build -t humanize-text-api .
docker stop humanize-api
docker rm humanize-api
docker run -d -p 3000:3000 --name humanize-api humanize-text-api
```

---

## 📝 بررسی وضعیت

```bash
# وضعیت container
docker ps

# استفاده از منابع
docker stats humanize-api

# دریافت IP container
docker inspect humanize-api | grep IPAddress
```
