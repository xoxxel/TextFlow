# استفاده از Node.js نسخه LTS
FROM node:18-alpine

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی فایل‌های package
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install --production

# کپی کد برنامه
COPY server.js ./
COPY dictionary ./dictionary

# تنظیم متغیر محیطی برای پورت
ENV PORT=3000

# باز کردن پورت
EXPOSE 3000

# اجرای برنامه
CMD ["node", "server.js"]
