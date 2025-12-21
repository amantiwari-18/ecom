# ecom

# E-Commerce Project

Full-stack e-commerce application with React frontend and Spring Boot backend.

## Frontend (Netlify)

**Deployment Steps:**
1. Push code to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-railway-backend.up.railway.app`

**Local Development:**
```bash
cd ecommerce-frontend
npm install
npm run dev
```

## Backend (Railway)

**Deployment Steps:**
1. Push code to GitHub
2. Create Railway project
3. Connect GitHub repo
4. Railway will auto-detect Dockerfile
5. Add env vars in Railway dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key

**Local Development:**
```bash
cd ecommerce-backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Build & Run:**
```bash
mvn clean package
java -jar target/ecommerce-backend.jar --spring.profiles.active=prod
```

## Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://your-railway-backend.up.railway.app
```

### Backend (Railway Dashboard)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-super-secret-jwt-key
PORT=8080
```