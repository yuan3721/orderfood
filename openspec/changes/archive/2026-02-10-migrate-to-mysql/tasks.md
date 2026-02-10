# Implementation Tasks: Migrate to MySQL

## Phase 1: 配置更新

### Task 1.1: 更新 Prisma Schema
**文件**: `apps/server/prisma/schema.prisma`

**变更**:
1. 修改 datasource 配置:
   ```prisma
   datasource db {
     provider = "mysql"  // 从 "postgresql" 改为 "mysql"
     url      = env("DATABASE_URL")
   }
   ```

2. 更新所有 ID 字段类型（从 `BigInt` 改为 `Int`）:
   - User.id
   - Merchant.id
   - Menu.id
   - Order.id
   - OrderItem.id
   - Payment.id

3. 验证其他数据类型（应该已经兼容）:
   - `Decimal @db.Decimal(10, 2)` - 保持不变
   - `String @db.VarChar(n)` - 保持不变
   - `DateTime` - 保持不变
   - `DateTime @db.Date` - 保持不变

**验收**: schema.prisma 文件语法正确，无错误提示

---

### Task 1.2: 更新 Docker Compose 配置
**文件**: `docker-compose.yml`

**变更**:
1. 替换 PostgreSQL 服务为 MySQL:
   ```yaml
   db:
     image: mysql:8.0
     environment:
       MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-password}
       MYSQL_DATABASE: ${DB_NAME:-orderfood}
       MYSQL_USER: ${DB_USER:-admin}
       MYSQL_PASSWORD: ${DB_PASSWORD:-password}
     ports:
       - "3306:3306"
     volumes:
       - mysql_data:/var/lib/mysql
     command: >
       --default-authentication-plugin=mysql_native_password
       --character-set-server=utf8mb4
       --collation-server=utf8mb4_unicode_ci
   ```

2. 更新 volumes 定义:
   ```yaml
   volumes:
     mysql_data:  # 从 postgres_data 改名
   ```

3. 删除 PostgreSQL 相关配置（如有）

**验收**: `docker-compose config` 无错误

---

### Task 1.3: 更新环境变量
**文件**: `apps/server/.env`, `apps/server/.env.example`

**变更**:
1. 更新 DATABASE_URL 格式:
   ```bash
   # 旧格式
   # DATABASE_URL="postgresql://admin:password@localhost:5432/orderfood?schema=public"
   
   # 新格式
   DATABASE_URL="mysql://admin:password@localhost:3306/orderfood"
   ```

2. 添加/更新 MySQL 相关变量:
   ```bash
   DB_NAME=orderfood
   DB_USER=admin
   DB_PASSWORD=password
   DB_ROOT_PASSWORD=rootpassword
   ```

**验收**: `.env.example` 文件包含所有必需变量

---

## Phase 2: 数据库迁移

### Task 2.1: 清理旧数据库环境
**命令行操作**

**步骤**:
1. 停止并删除 PostgreSQL 容器和卷:
   ```bash
   docker-compose down -v
   ```

2. 删除旧的 Prisma 迁移历史:
   ```bash
   rm -rf apps/server/prisma/migrations
   ```

**验收**: 无 PostgreSQL Docker 容器运行，migrations 目录不存在

---

### Task 2.2: 启动 MySQL 数据库
**命令行操作**

**步骤**:
1. 启动 MySQL 容器:
   ```bash
   docker-compose up -d db
   ```

2. 验证 MySQL 启动成功:
   ```bash
   docker-compose logs db
   ```

3. 测试数据库连接:
   ```bash
   docker-compose exec db mysql -u admin -p orderfood
   ```

**验收**: MySQL 容器运行正常，可以连接数据库

---

### Task 2.3: 创建 MySQL 迁移
**命令行操作**

**步骤**:
1. 生成初始迁移:
   ```bash
   cd apps/server
   pnpm prisma migrate dev --name init-mysql
   ```

2. 检查生成的 SQL:
   - 查看 `prisma/migrations/<timestamp>_init-mysql/migration.sql`
   - 验证所有表、字段、索引正确创建

3. 生成 Prisma Client:
   ```bash
   pnpm prisma generate
   ```

**验收**: 
- `apps/server/prisma/migrations/` 包含新的迁移文件
- 所有表在 MySQL 中成功创建
- Prisma Client 无错误生成

---

### Task 2.4: 验证数据库结构
**命令行操作**

**步骤**:
1. 查看创建的表:
   ```sql
   SHOW TABLES;
   ```

2. 检查关键表结构:
   ```sql
   DESCRIBE users;
   DESCRIBE merchants;
   DESCRIBE menus;
   DESCRIBE orders;
   DESCRIBE order_items;
   DESCRIBE payments;
   ```

3. 验证索引:
   ```sql
   SHOW INDEX FROM menus;
   SHOW INDEX FROM orders;
   ```

4. 确认字符集:
   ```sql
   SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
   FROM information_schema.SCHEMATA
   WHERE SCHEMA_NAME = 'orderfood';
   ```

**验收**: 
- 所有 6 个表存在
- ID 字段类型为 INT AUTO_INCREMENT
- 所有索引存在
- 字符集为 utf8mb4

---

## Phase 3: 代码验证

### Task 3.1: 验证 Prisma Client 初始化
**文件**: `apps/server/src/lib/prisma.ts`

**检查**:
1. 确认 Prisma Client 导入和初始化无需修改
2. 连接测试正常

**验收**: 文件无需修改（Prisma ORM 自动适配）

---

### Task 3.2: 检查原生 SQL 查询
**文件**: 搜索所有使用 `$queryRaw` 或 `$executeRaw` 的代码

**步骤**:
1. 全局搜索:
   ```bash
   grep -r "\$queryRaw\|\$executeRaw" apps/server/src
   ```

2. 如有发现，检查是否使用 PostgreSQL 特有语法
3. 必要时改写为 MySQL 兼容语法

**验收**: 无 PostgreSQL 特定的原生查询，或已改写

---

### Task 3.3: 更新包依赖
**文件**: `apps/server/package.json`

**步骤**:
1. 验证 Prisma 版本支持 MySQL（通常无需变更）:
   ```json
   "@prisma/client": "^5.x.x",
   "prisma": "^5.x.x"
   ```

2. 安装依赖:
   ```bash
   pnpm install
   ```

**验收**: 依赖安装成功，无警告

---

## Phase 4: 功能测试

### Task 4.1: 启动服务器
**命令行操作**

**步骤**:
1. 启动完整环境:
   ```bash
   docker-compose up -d
   ```

2. 启动开发服务器:
   ```bash
   pnpm --filter server dev
   ```

**验收**: 服务器无错误启动，可以访问 API

---

### Task 4.2: 测试用户功能
**测试场景**

**API 测试**:
1. 用户登录: `POST /api/auth/login`
2. 获取用户信息: `GET /api/auth/me`
3. 更新用户信息: `PUT /api/users/:id`

**验收**: 所有用户相关 API 正常工作

---

### Task 4.3: 测试菜单功能
**测试场景**

**API 测试**:
1. 获取菜单列表: `GET /api/menu`
2. 创建菜单: `POST /api/admin/menu`
3. 更新菜单: `PUT /api/admin/menu/:id`
4. 删除菜单: `DELETE /api/admin/menu/:id`

**验收**: 所有菜单 CRUD 操作正常

---

### Task 4.4: 测试订单功能
**测试场景**

**API 测试**:
1. 创建订单: `POST /api/order`
2. 获取订单列表: `GET /api/order`
3. 获取订单详情: `GET /api/order/:id`
4. 取消订单: `PUT /api/order/:id/cancel`
5. 订单统计: `GET /api/admin/order/stats`

**验收**: 所有订单操作正常，统计数据正确

---

### Task 4.5: 测试支付功能
**测试场景**

**API 测试**:
1. 创建支付: `POST /api/payment/create`
2. 支付回调: `POST /api/payment/callback`
3. 查询支付状态: `GET /api/payment/:id`

**验收**: 支付流程完整，数据正确

---

### Task 4.6: 测试数据关联
**测试场景**

**复杂查询测试**:
1. 订单包含订单项（include orderItems）
2. 订单包含用户信息（include user）
3. 菜单包含商家信息（include merchant）
4. 商家包含所有菜单（include menus）

**验收**: 所有关联查询返回正确数据

---

### Task 4.7: 测试事务操作
**测试场景**

**事务测试**:
1. 创建订单（包含多个订单项）- 应在一个事务中
2. 支付成功更新订单状态 - 事务回滚测试
3. 取消订单恢复库存 - 事务完整性

**验收**: 事务正确执行，数据一致性保证

---

### Task 4.8: 测试中文数据
**测试场景**

**中文存储测试**:
1. 创建包含中文的菜单名称
2. 创建包含中文的订单备注
3. 查询并验证中文显示正常

**验收**: 中文数据存储和检索无乱码

---

## Phase 5: 性能验证

### Task 5.1: 查询性能测试
**测试目标**

**测试用例**:
1. 简单查询（单表）: 应 < 50ms
2. 关联查询（1-2 层）: 应 < 100ms
3. 复杂统计查询: 应 < 500ms
4. 分页查询（100 条）: 应 < 100ms

**验收**: 查询性能满足目标

---

### Task 5.2: 并发测试
**测试工具**: Apache Bench 或 wrk

**测试场景**:
1. 并发创建订单（10 并发，100 请求）
2. 并发查询菜单列表（20 并发，1000 请求）

**验收**: 
- 无死锁
- 无数据不一致
- 响应时间合理

---

## Phase 6: 文档更新

### Task 6.1: 更新 README
**文件**: `README.md`

**更新内容**:
1. 数据库说明（从 PostgreSQL 改为 MySQL）
2. 环境要求（MySQL 8.0）
3. 快速开始步骤（Docker Compose 命令）
4. 数据库初始化说明（Prisma migrate）

**验收**: README 准确反映当前技术栈

---

### Task 6.2: 更新开发文档
**文件**: 相关开发文档（如有）

**更新内容**:
1. 环境搭建指南
2. 数据库连接配置
3. 迁移命令说明

**验收**: 新开发者可以根据文档成功搭建环境

---

## Phase 7: 清理和优化

### Task 7.1: 清理 PostgreSQL 依赖
**检查项**

**步骤**:
1. 确认 package.json 中无 PostgreSQL 特定包（如 `pg`）
2. 确认 Docker Compose 中无 PostgreSQL 服务
3. 删除旧的数据卷（如果不再需要）

**验收**: 项目中无 PostgreSQL 痕迹

---

### Task 7.2: 索引优化（可选）
**性能优化**

**考虑**:
1. 根据实际查询模式添加索引
2. 分析慢查询日志
3. 使用 `EXPLAIN` 优化查询计划

**验收**: 关键查询有合适的索引

---

### Task 7.3: 备份策略（可选）
**生产准备**

**配置**:
1. 设置 MySQL 自动备份
2. 配置 Docker 卷持久化
3. 文档化恢复流程

**验收**: 有明确的备份和恢复方案

---

## Summary

**总任务数**: 23 个主要任务  
**预估时间**: 4-6 小时（包括测试）  
**关键路径**: Phase 1 → Phase 2 → Phase 3 → Phase 4

**风险提示**:
- 如果有生产数据，需要额外的数据迁移任务
- 首次迁移建议在测试环境完整执行一遍
- 保留 PostgreSQL 备份直到 MySQL 稳定运行

**完成标准**:
- ✅ 所有 23 个任务完成
- ✅ 所有测试通过
- ✅ 文档更新完整
- ✅ 服务器稳定运行

---

## Quick Start Checklist

对于快速开始，按顺序执行以下关键任务：

1. [ ] Task 1.1 - 更新 Prisma Schema
2. [ ] Task 1.2 - 更新 Docker Compose
3. [ ] Task 1.3 - 更新环境变量
4. [ ] Task 2.1 - 清理旧环境
5. [ ] Task 2.2 - 启动 MySQL
6. [ ] Task 2.3 - 创建迁移
7. [ ] Task 4.1 - 启动服务器
8. [ ] Task 4.2-4.7 - 功能测试
9. [ ] Task 6.1 - 更新 README
10. [ ] Task 7.1 - 清理依赖

最少可行迁移（MVP）只需完成 1-8 步。
