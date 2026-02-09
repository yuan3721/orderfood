
cd apps/server && npx prisma migrate dev

# 安装依赖
pnpm install

# 启动数据库 (使用 Docker)
docker-compose up db -d

# 运行数据库迁移
cd apps/server && npx prisma migrate dev

# 启动后端服务
pnpm dev:server

# 启动 C 端小程序
pnpm dev:user

# 启动 B 端小程序
pnpm dev:merchan