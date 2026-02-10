## Overview

将现有的点餐系统从 PostgreSQL 数据库迁移到 MySQL 数据库。这是一个破坏性变更，需要更新 Prisma schema、Docker 配置以及数据库连接设置。迁移将保持数据模型的完整性，同时适应 MySQL 的特定语法和限制。

## Technical Approach

### 1. Prisma Schema 迁移

**Provider 变更**
- 将 `datasource db.provider` 从 `"postgresql"` 改为 `"mysql"`
- 保持 `url = env("DATABASE_URL")` 不变，但需更新实际连接字符串格式

**数据类型映射**
- **BigInt** → MySQL 不支持 `BIGINT` 自增 ID 在某些场景，考虑两种方案：
  - 方案 A：改用 `Int` 类型（适用于数据量不大的场景）
  - 方案 B：保持 `BigInt` 但使用 `@db.BigInt` 显式声明
  - **建议采用方案 A**：根据点餐系统的规模，`Int` (约 21 亿) 完全够用
  
- **Decimal** → 保持 `Decimal @db.Decimal(10, 2)` 语法，MySQL 原生支持
  
- **DateTime** → MySQL 的 `DATETIME` 支持，但需注意：
  - `@db.Date` 映射到 `DATE`
  - `@db.DateTime` 默认映射（可选显式声明）
  - MySQL 5.6+ 支持毫秒精度：`@db.DateTime(3)`
  
- **String** → `@db.VarChar(n)` 和 `@db.Text` 都兼容 MySQL

**索引调整**
- MySQL 索引名称限制为 64 字符（当前索引已满足）
- 多列索引保持语法不变
- `@@index([date], name: "idx_name")` 语法兼容

### 2. Docker 配置

**docker-compose.yml 变更**
```yaml
# 原来的 postgres 服务
db:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: orderfood
    POSTGRES_USER: admin
    POSTGRES_PASSWORD: password
  ports:
    - "5432:5432"

# 改为 mysql 服务
db:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: password
    MYSQL_DATABASE: orderfood
    MYSQL_USER: admin
    MYSQL_PASSWORD: password
  ports:
    - "3306:3306"
  command: --default-authentication-plugin=mysql_native_password
```

**关键考虑**
- MySQL 8.0 默认使用 `caching_sha2_password`，但某些客户端可能需要 `mysql_native_password`
- 添加字符集配置：`--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`

### 3. 环境变量

**DATABASE_URL 格式变更**
```bash
# PostgreSQL
DATABASE_URL="postgresql://admin:password@localhost:5432/orderfood?schema=public"

# MySQL
DATABASE_URL="mysql://admin:password@localhost:3306/orderfood"
```

**注意事项**
- MySQL 连接字符串不需要 `?schema=public` 参数
- 如需 SSL 连接：`mysql://user:pass@host:3306/db?sslmode=require`

### 4. Prisma 迁移策略

**开发环境**
```bash
# 1. 更新 schema.prisma
# 2. 创建新的迁移
pnpm --filter server prisma migrate dev --name switch-to-mysql

# 3. 生成 Prisma Client
pnpm --filter server prisma generate
```

**生产环境数据迁移**
1. **导出 PostgreSQL 数据**
   ```bash
   pg_dump -U admin -h localhost orderfood > backup.sql
   ```

2. **数据转换**（如果有生产数据）
   - 手动调整 SQL 语法差异
   - 或使用数据迁移工具（如 `pgloader`）
   - 或编写 Node.js 脚本通过 ORM 迁移

3. **导入 MySQL**
   - 使用 Prisma 重新生成数据库结构：`prisma migrate deploy`
   - 使用迁移脚本导入数据

**简化方案**（如果当前无重要生产数据）
- 直接删除 `prisma/migrations/` 目录
- 运行 `prisma migrate dev --name init-mysql` 创建全新迁移历史

### 5. 代码变更检查点

**需要验证的文件**
- `apps/server/src/lib/prisma.ts` - Prisma Client 初始化无需变更
- 所有控制器和服务代码 - Prisma API 调用保持不变
- 查询语句 - 检查是否有原生 SQL 查询（`prisma.$queryRaw`）

**潜在的不兼容代码**
```typescript
// PostgreSQL 特有功能（需要检查代码中是否使用）
- 数组类型 (String[])
- JSON 操作符 (@> 等)
- 全文搜索 (@@)
- RETURNING 子句
```

根据当前代码结构，应该不存在这些高级特性，因为都是通过 Prisma ORM 操作。

### 6. 测试计划

**单元测试**
- 所有 Prisma 模型操作测试
- CRUD 操作验证

**集成测试**
- API 端点测试
- 数据库事务测试
- 并发操作测试

**性能测试**
- 查询性能对比（PostgreSQL vs MySQL）
- 索引效果验证

## Implementation Sequence

1. **更新配置文件**
   - `schema.prisma`: 修改 provider 和数据类型
   - `docker-compose.yml`: 切换到 MySQL 镜像
   - `.env.example`: 更新连接字符串示例

2. **清理和重建数据库**
   - 停止现有 PostgreSQL 容器
   - 启动 MySQL 容器
   - 删除旧的 migrations（如果数据可丢弃）

3. **生成新迁移**
   - 运行 `prisma migrate dev`
   - 验证生成的 SQL

4. **更新依赖**
   - 确保 `@prisma/client` 版本支持 MySQL
   - 不需要额外的 MySQL 驱动（Prisma 内置）

5. **测试验证**
   - 运行所有测试
   - 手动测试关键功能

6. **文档更新**
   - README.md 中的数据库设置说明
   - 开发环境搭建指南

## Risks and Mitigations

### Risk: 数据类型不兼容

**问题**: `BigInt` 可能在某些 MySQL 版本中表现不同  
**缓解**: 改用 `Int` 类型，对点餐系统足够用

### Risk: 索引行为差异

**问题**: PostgreSQL 和 MySQL 的索引优化器不同  
**缓解**: 保持现有索引结构，后续根据性能监控调整

### Risk: 字符编码问题

**问题**: 默认字符集可能导致中文乱码  
**缓解**: 显式设置 `utf8mb4` 字符集

### Risk: 现有生产数据

**问题**: 如果有生产数据需要迁移  
**缓解**: 提供数据导出导入脚本（或确认当前为开发阶段无重要数据）

## Success Criteria

- [ ] Docker 环境成功启动 MySQL 数据库
- [ ] Prisma 迁移成功执行，所有表创建正确
- [ ] Prisma Client 正确生成
- [ ] 所有 API 端点正常工作
- [ ] 数据 CRUD 操作正确
- [ ] 事务和关联查询正常
- [ ] 索引正常工作，查询性能可接受
- [ ] 开发文档已更新
