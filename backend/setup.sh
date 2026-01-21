#!/bin/bash

echo "🚀 Setting up Attend Ease Backend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if PostgreSQL is accessible
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL client (psql) is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is available${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Generate Prisma Client
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
npx prisma generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to run migrations${NC}"
    echo -e "${RED}   Please check your database connection${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Seed database
echo -e "${BLUE}🌱 Seeding database with initial data...${NC}"
npx ts-node prisma/seed.ts

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database seeded successfully${NC}"
echo ""

# Create storage directories
echo -e "${BLUE}📁 Creating storage directories...${NC}"
mkdir -p uploads
mkdir -p storage/salary-slips
mkdir -p backups

echo -e "${GREEN}✅ Storage directories created${NC}"
echo ""

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Default Credentials:${NC}"
echo -e "   Email: ${GREEN}admin@seedlab.com${NC}"
echo -e "   Password: ${GREEN}admin123${NC}"
echo ""
echo -e "${BLUE}🚀 To start the development server:${NC}"
echo -e "   ${GREEN}npm run start:dev${NC}"
echo ""
echo -e "${BLUE}📚 API Documentation will be available at:${NC}"
echo -e "   ${GREEN}http://localhost:3000/api/docs${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Change the default password in production!${NC}"
