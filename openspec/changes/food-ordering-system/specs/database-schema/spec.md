## ADDED Requirements

### Requirement: 用户表 (users)
数据库 SHALL 包含用户表，存储用户基本信息。

#### Scenario: 用户表结构
- **WHEN** 查看用户表结构
- **THEN** 表包含以下字段：
  - `id` (BIGINT, PK, 自增) - 用户ID
  - `openid` (VARCHAR(64), UNIQUE, NOT NULL) - 微信 openid
  - `nickname` (VARCHAR(50)) - 昵称
  - `avatar` (VARCHAR(255)) - 头像 URL
  - `phone` (VARCHAR(20)) - 手机号（可选）
  - `created_at` (TIMESTAMP, DEFAULT NOW()) - 创建时间
  - `updated_at` (TIMESTAMP) - 更新时间

---

### Requirement: 商家表 (merchants)
数据库 SHALL 包含商家表，存储商家登录信息。

#### Scenario: 商家表结构
- **WHEN** 查看商家表结构
- **THEN** 表包含以下字段：
  - `id` (BIGINT, PK, 自增) - 商家ID
  - `name` (VARCHAR(100), NOT NULL) - 商家名称
  - `account` (VARCHAR(50), UNIQUE, NOT NULL) - 登录账号
  - `password` (VARCHAR(255), NOT NULL) - 密码（加密存储）
  - `openid` (VARCHAR(64)) - 微信 openid（扫码登录用）
  - `role` (VARCHAR(20), DEFAULT 'admin') - 角色：admin/operator
  - `created_at` (TIMESTAMP, DEFAULT NOW()) - 创建时间

---

### Requirement: 菜谱表 (menus)
数据库 SHALL 包含菜谱表，存储每日菜品信息。

#### Scenario: 菜谱表结构
- **WHEN** 查看菜谱表结构
- **THEN** 表包含以下字段：
  - `id` (BIGINT, PK, 自增) - 菜品ID
  - `date` (DATE, NOT NULL) - 菜单日期
  - `name` (VARCHAR(100), NOT NULL) - 菜名
  - `price` (DECIMAL(10,2), NOT NULL) - 单价
  - `image` (VARCHAR(255)) - 图片 URL
  - `stock` (INT, NOT NULL, DEFAULT 0) - 库存数量
  - `sold` (INT, NOT NULL, DEFAULT 0) - 已售数量
  - `cutoff_time` (TIMESTAMP, NOT NULL) - 截止时间
  - `merchant_id` (BIGINT, FK -> merchants.id) - 商家ID
  - `created_at` (TIMESTAMP, DEFAULT NOW()) - 创建时间
  - `updated_at` (TIMESTAMP) - 更新时间

#### Scenario: 菜谱表索引
- **WHEN** 查看菜谱表索引
- **THEN** 存在以下索引：
  - `idx_menus_date` ON (date) - 按日期查询
  - `idx_menus_merchant_date` ON (merchant_id, date) - 按商家和日期查询

---

### Requirement: 订单表 (orders)
数据库 SHALL 包含订单表，存储用户订单信息。

#### Scenario: 订单表结构
- **WHEN** 查看订单表结构
- **THEN** 表包含以下字段：
  - `id` (BIGINT, PK, 自增) - 订单ID
  - `order_no` (VARCHAR(32), UNIQUE, NOT NULL) - 订单号
  - `user_id` (BIGINT, FK -> users.id, NOT NULL) - 用户ID
  - `merchant_id` (BIGINT, FK -> merchants.id) - 商家ID
  - `total_price` (DECIMAL(10,2), NOT NULL) - 总价
  - `status` (TINYINT, NOT NULL, DEFAULT 0) - 状态：0待支付 1已支付 2已取消
  - `created_at` (TIMESTAMP, DEFAULT NOW()) - 下单时间
  - `paid_at` (TIMESTAMP) - 支付时间
  - `canceled_at` (TIMESTAMP) - 取消时间
  - `remark` (TEXT) - 备注

#### Scenario: 订单表索引
- **WHEN** 查看订单表索引
- **THEN** 存在以下索引：
  - `idx_orders_user` ON (user_id, created_at DESC) - 用户订单查询
  - `idx_orders_merchant_date` ON (merchant_id, created_at) - 商家按日期查询订单
  - `idx_orders_order_no` ON (order_no) - 按订单号查询

---

### Requirement: 订单详情表 (order_items)
数据库 SHALL 包含订单详情表，存储订单中的菜品明细。

#### Scenario: 订单详情表结构
- **WHEN** 查看订单详情表结构
- **THEN** 表包含以下字段：
  - `id` (BIGINT, PK, 自增) - 明细ID
  - `order_id` (BIGINT, FK -> orders.id, NOT NULL) - 订单ID
  - `menu_id` (BIGINT, FK -> menus.id, NOT NULL) - 菜品ID
  - `menu_name` (VARCHAR(100), NOT NULL) - 菜名（冗余，防止菜品删除后丢失）
  - `quantity` (INT, NOT NULL) - 数量
  - `price` (DECIMAL(10,2), NOT NULL) - 下单时单价（冗余）
  - `subtotal` (DECIMAL(10,2), NOT NULL) - 小计

#### Scenario: 订单详情表索引
- **WHEN** 查看订单详情表索引
- **THEN** 存在以下索引：
  - `idx_order_items_order` ON (order_id) - 按订单查询明细

---

### Requirement: 支付记录表 (payments)
数据库 SHALL 包含支付记录表，存储支付流水信息。

#### Scenario: 支付记录表结构
- **WHEN** 查看支付记录表结构
- **THEN** 表包含以下字段：
  - `id` (BIGINT, PK, 自增) - 支付ID
  - `order_id` (BIGINT, FK -> orders.id, NOT NULL) - 订单ID
  - `transaction_id` (VARCHAR(64)) - 微信支付交易号
  - `amount` (DECIMAL(10,2), NOT NULL) - 支付金额
  - `status` (TINYINT, NOT NULL) - 状态：0待支付 1成功 2失败
  - `pay_time` (TIMESTAMP) - 支付时间
  - `created_at` (TIMESTAMP, DEFAULT NOW()) - 创建时间

---

### Requirement: 数据库约束
数据库 SHALL 实现必要的外键约束和数据完整性。

#### Scenario: 外键约束
- **WHEN** 删除用户
- **THEN** 该用户的订单保留（不级联删除），仅标记用户为已删除

#### Scenario: 库存约束
- **WHEN** 更新菜品库存
- **THEN** 库存 + 已售 SHALL 等于初始库存（库存扣减逻辑正确）
