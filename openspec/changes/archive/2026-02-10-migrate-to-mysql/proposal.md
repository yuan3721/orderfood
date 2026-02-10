## Why

当前系统使用 PostgreSQL 作为数据库。为了降低部署和运维成本，提高与更广泛生态系统的兼容性，需要将数据库迁移到 MySQL。MySQL 在共享主机环境下更易于获取和配置，且在中小型应用场景下具有更好的性价比。

## What Changes

- **BREAKING** 更新 Prisma schema 从 PostgreSQL provider 改为 MySQL provider
- 调整数据类型映射（如 `BigInt` ID 类型、`Decimal` 类型、`DateTime` 类型等）
- 修改数据库连接配置和环境变量
- 更新 Docker 配置从 PostgreSQL 镜像切换到 MySQL 镜像
- 调整任何数据库特定的查询或功能（如全文搜索、JSON 操作等）
- 更新迁移脚本和种子数据

## Capabilities

### New Capabilities
- `database-migration`: MySQL 数据库迁移策略，包括数据类型映射、Schema 调整、数据迁移计划

### Modified Capabilities

无现有 capabilities 需要修改（这是新的 OpenSpec 项目）

## Impact

**直接影响的组件：**
- `apps/server/prisma/schema.prisma` - Prisma schema 配置
- `apps/server/.env` - 数据库连接字符串
- `docker-compose.yml` - 数据库服务配置
- `apps/server/src/lib/prisma.ts` - Prisma 客户端初始化（可能需要调整）

**潜在影响：**
- 所有数据库查询操作（通过 Prisma Client，应该是透明的）
- 现有数据需要迁移脚本
- CI/CD 管道中的数据库初始化脚本
- 开发环境设置文档

**依赖变更：**
- 移除 PostgreSQL 相关依赖
- 安装 MySQL2 驱动（Prisma 的 MySQL connector）
- Docker 镜像从 `postgres` 切换到 `mysql`
