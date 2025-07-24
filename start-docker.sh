#!/b# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --volumes --remove-orphans

# Clean up Docker system
echo "🧹 Cleaning up Docker system..."
docker system prune -f

# Build and start all services
echo "🏗️ Building and starting all services..."
docker-compose build --no-cache
docker-compose up -do "🚀 Starting NeoTalent Docker Environment with Docker Compose..."

# Stop any existing containers
echo "� Stopping existing containers..."
docker-compose down --volumes --remove-orphans

# Clean up Docker system
echo "🧹 Cleaning up Docker system..."
docker system prune -f

# Build and start all services
echo "🏗️ Building and starting all services..."
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "✅ Docker environment started!"
echo ""
echo "🔗 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   MongoDB: localhost:27017"
echo ""
echo "🔐 SSH Access for DbVisualizer:"
echo "   MongoDB SSH: ssh -p 2221 mongouser@localhost (password: mongopass123)"
echo "   Backend SSH: ssh -p 2222 backenduser@localhost (password: backendpass123)"
echo ""
echo "📊 Container Status:"
docker-compose ps
echo ""
echo "🌐 Testing Frontend..."
curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" http://localhost:3000 || echo "Frontend not ready yet"
echo ""
echo "⚡ Testing Backend..."
curl -s -o /dev/null -w "Backend Status: %{http_code}\n" http://localhost:3001 || echo "Backend not ready yet"
