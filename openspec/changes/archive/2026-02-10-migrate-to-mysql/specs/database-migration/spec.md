# Database Migration Specification

## Overview

本规范定义了从 PostgreSQL 迁移到 MySQL 的数据库迁移策略，包括数据类型映射规则、Schema 调整方案以及数据迁移计划。

## Requirements

### R1: Prisma Schema Provider

**描述**: Prisma schema 必须配置为使用 MySQL provider  
**优先级**: P0 (Blocker)

**验收标准**:
- `datasource db.provider` 设置为 `"mysql"`
- 数据库连接 URL 格式符合 MySQL 规范: `mysql://user:pass@host:port/database`

### R2: 数据类型兼容性

**描述**: 所有数据模型的字段类型必须与 MySQL 兼容  
**优先级**: P0 (Blocker)

**类型映射规则**:

| Prisma 类型 | PostgreSQL 映射 | MySQL 映射 | 变更 |
|------------|----------------|-----------|------|
| Int        | INTEGER        | INT       | 无变更 |
| BigInt     | BIGINT         | BIGINT    | **建议改为 Int** |
| String     | VARCHAR(n)     | VARCHAR(n)| 无变更 |
| String     | TEXT           | TEXT      | 无变更 |
| Decimal    | DECIMAL(p,s)   | DECIMAL(p,s) | 无变更 |
| DateTime   | TIMESTAMP      | DATETIME  | 行为略有差异 |
| DateTime @db.Date | DATE    | DATE      | 无变更 |
| Boolean    | BOOLEAN        | TINYINT(1)| 无变更（Prisma 自动处理） |

**验收标准**:
- 所有 ID 字段使用 `Int` 而非 `BigInt`（推荐）
- 价格字段保持 `Decimal @db.Decimal(10, 2)`
- 字符串字段使用 `@db.VarChar(n)` 或 `@db.Text`
- 时间字段使用 `DateTime`，日期字段使用 `DateTime @db.Date`

### R3: 主键和自增策略

**描述**: 自增主键必须正确配置  
**优先级**: P0 (Blocker)

**规则**:
```prisma
// PostgreSQL 风格（旧）
id BigInt @id @default(autoincrement())

// MySQL 风格（新）
id Int @id @default(autoincrement())
```

**验收标准**:
- 所有主键使用 `@id @default(autoincrement())`
- 使用 `Int` 类型，范围 -2,147,483,648 到 2,147,483,647（对点餐系统足够）

### R4: 索引兼容性

**描述**: 所有索引必须符合 MySQL 的限制  
**优先级**: P1 (Critical)

**MySQL 索引限制**:
- 索引名称最多 64 个字符
- 复合索引最多 16 列（当前未接近此限制）
- InnoDB 表行大小限制（约 8KB），影响大型索引

**验收标准**:
- 所有索引名称 ≤ 64 字符
- 保持现有的 `@@index` 定义语法
- 验证索引在 MySQL 中成功创建

### R5: 外键和关联

**描述**: 模型关联关系必须正确映射  
**优先级**: P0 (Blocker)

**规则**:
- Prisma 关联语法在 PostgreSQL 和 MySQL 间保持一致
- `onDelete: Cascade` 等行为保持不变
- 外键约束由 Prisma 自动生成

**验收标准**:
- 所有 `@relation` 定义保持不变
- 外键约束在 MySQL 中正确创建
- 级联删除和更新行为正确

### R6: 字符集和编码

**描述**: 数据库必须使用 UTF-8 字符集以支持中文  
**优先级**: P0 (Blocker)

**规则**:
- 数据库字符集: `utf8mb4`
- 排序规则: `utf8mb4_unicode_ci`

**验收标准**:
- MySQL 容器配置包含字符集参数
- 创建的表使用 `utf8mb4` 字符集
- 中文数据存储和检索正常

### R7: Docker 环境配置

**描述**: Docker Compose 必须配置 MySQL 服务  
**优先级**: P0 (Blocker)

**规则**:
```yaml
db:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    MYSQL_DATABASE: ${DB_NAME}
    MYSQL_USER: ${DB_USER}
    MYSQL_PASSWORD: ${DB_PASSWORD}
  ports:
    - "3306:3306"
  command: >
    --default-authentication-plugin=mysql_native_password
    --character-set-server=utf8mb4
    --collation-server=utf8mb4_unicode_ci
```

**验收标准**:
- MySQL 8.0 容器成功启动
- 端口 3306 正确暴露
- 字符集配置生效
- 认证插件兼容 Prisma

### R8: 环境变量

**描述**: 环境变量必须更新为 MySQL 连接格式  
**优先级**: P0 (Blocker)

**规则**:
```bash
# 旧 (PostgreSQL)
DATABASE_URL="postgresql://admin:password@localhost:5432/orderfood?schema=public"

# 新 (MySQL)
DATABASE_URL="mysql://admin:password@localhost:3306/orderfood"
```

**验收标准**:
- 所有环境文件（`.env`, `.env.example`）已更新
- 连接字符串格式正确
- 去除 PostgreSQL 特有参数（如 `?schema=public`）

### R9: Prisma 迁移

**描述**: 数据库迁移必须正确执行  
**优先级**: P0 (Blocker)

**迁移策略**:

**开发环境（无重要数据）**:
```bash
# 1. 删除旧迁移历史
rm -rf apps/server/prisma/migrations

# 2. 创建初始 MySQL 迁移
pnpm --filter server prisma migrate dev --name init-mysql

# 3. 生成 Prisma Client
pnpm --filter server prisma generate
```

**生产环境（有数据需迁移）**:
```bash
# 1. 备份 PostgreSQL 数据
pg_dump -U user -h host dbname > backup.sql

# 2. 更新 schema.prisma

# 3. 创建新迁移
prisma migrate dev --name migrate-to-mysql

# 4. 部署到生产
prisma migrate deploy

# 5. 数据迁移（需要自定义脚本）
node scripts/migrate-data.js
```

**验收标准**:
- 迁移文件成功生成
- 所有表在 MySQL 中正确创建
- Prisma Client 无错误生成
- 数据（如有）成功迁移

### R10: 代码兼容性验证

**描述**: 应用代码必须与 MySQL 后端兼容  
**优先级**: P1 (Critical)

**检查点**:
- [ ] 无原生 SQL 查询（`$queryRaw`）使用 PostgreSQL 特有语法
- [ ] 无使用 PostgreSQL 专属类型（如数组、JSON 操作符）
- [ ] 所有 Prisma 查询使用标准 API
- [ ] 事务操作正常工作

**验收标准**:
- 所有 API 端点正常响应
- CRUD 操作功能正常
- 关联查询返回正确结果
- 无数据库相关错误

## Data Migration Plan

### 场景 1: 开发环境（推荐）

**前提**: 当前无重要数据，可以重建数据库

**步骤**:
1. 更新 `schema.prisma`
2. 删除 `prisma/migrations/` 目录
3. 删除 PostgreSQL 容器和卷: `docker-compose down -v`
4. 更新 `docker-compose.yml` 和 `.env`
5. 启动 MySQL 容器: `docker-compose up -d db`
6. 创建新迁移: `pnpm --filter server prisma migrate dev --name init-mysql`
7. 运行种子数据（如有）: `pnpm --filter server prisma db seed`

**优点**: 简单、干净、避免兼容性问题  
**缺点**: 丢失现有数据

### 场景 2: 生产环境（复杂）

**前提**: 有重要生产数据需要保留

**步骤**:
1. **准备阶段**
   - 在测试环境模拟完整迁移流程
   - 备份 PostgreSQL 数据库
   - 编写数据迁移脚本

2. **停机迁移**（推荐）
   - 设置维护模式，停止应用
   - 导出 PostgreSQL 数据
   - 切换到 MySQL，运行迁移
   - 导入数据
   - 验证数据完整性
   - 启动应用

3. **零停机迁移**（复杂）
   - 设置双写（同时写入 PG 和 MySQL）
   - 批量同步历史数据
   - 验证数据一致性
   - 切换读取到 MySQL
   - 停止写入 PostgreSQL

**推荐**: 对于小型点餐系统，停机迁移更可靠

## Testing Requirements

### T1: 单元测试

**要求**: 所有数据模型操作通过测试

**测试用例**:
- Create: 创建各类实体
- Read: 查询单个和多个记录
- Update: 更新字段值
- Delete: 删除记录
- Relations: 关联查询（include, select）
- Filters: where 条件过滤
- Sorting: orderBy 排序
- Pagination: skip, take 分页

### T2: 集成测试

**要求**: API 端点与 MySQL 正常通信

**测试范围**:
- 用户认证流程
- 菜单 CRUD
- 订单创建和查询
- 支付记录
- 商家管理

### T3: 性能测试

**要求**: 查询性能可接受

**指标**:
- 简单查询: < 50ms
- 关联查询: < 100ms
- 复杂查询（统计）: < 500ms
- 并发写入: 无死锁

### T4: 数据完整性测试

**要求**: 数据约束正确执行

**验证**:
- 唯一约束（unique）
- 非空约束（required）
- 外键约束（relations）
- 级联删除（onDelete: Cascade）
- 默认值（@default）

## Success Criteria

迁移成功的标准：

1. **配置正确**
   - ✅ Prisma schema 使用 MySQL provider
   - ✅ Docker 环境运行 MySQL 8.0
   - ✅ 环境变量格式正确

2. **数据库正常**
   - ✅ 所有表创建成功
   - ✅ 索引全部生效
   - ✅ 外键约束正确
   - ✅ 字符集为 utf8mb4

3. **应用功能**
   - ✅ 所有 API 正常工作
   - ✅ CRUD 操作成功
   - ✅ 关联查询正确
   - ✅ 事务功能正常

4. **测试通过**
   - ✅ 单元测试全部通过
   - ✅ 集成测试全部通过
   - ✅ 数据完整性验证通过
   - ✅ 性能满足要求

5. **文档更新**
   - ✅ README.md 更新数据库说明
   - ✅ 环境变量示例文件更新
   - ✅ 开发指南更新依赖安装说明

## References

- [Prisma MySQL Connector](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/refman/8.0/en/)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL to MySQL Migration Guide](https://dev.mysql.com/doc/workbench/en/wb-migration-database-postgresql.html)
