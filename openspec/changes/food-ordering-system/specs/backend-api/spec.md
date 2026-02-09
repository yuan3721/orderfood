## ADDED Requirements

### Requirement: 用户认证接口
服务端 SHALL 提供微信登录认证接口，返回 JWT Token。

#### Scenario: 微信登录成功
- **WHEN** 客户端发送 `POST /api/v1/auth/login` 请求，携带微信 code
- **THEN** 服务端验证 code，创建或获取用户，返回 JWT Token

#### Scenario: 无效 code
- **WHEN** 客户端发送无效的微信 code
- **THEN** 服务端返回 401 错误

---

### Requirement: 获取今日菜单接口
服务端 SHALL 提供获取当日菜谱的接口。

#### Scenario: 获取今日菜单
- **WHEN** 客户端发送 `GET /api/v1/menu/today`
- **THEN** 服务端返回今日所有菜品列表，包含 id、name、price、image、stock、cutoffTime

#### Scenario: 无今日菜单
- **WHEN** 商家未上传今日菜谱
- **THEN** 服务端返回空数组

---

### Requirement: 创建订单接口
服务端 SHALL 提供创建订单的接口。

#### Scenario: 成功创建订单
- **WHEN** 客户端发送 `POST /api/v1/order/create`，携带菜品列表和数量
- **THEN** 服务端校验截止时间和库存，创建订单，扣减库存，返回订单信息

#### Scenario: 截止时间校验
- **WHEN** 当前时间已超过截止时间
- **THEN** 服务端返回 400 错误，message: "点餐已截止"

#### Scenario: 库存校验
- **WHEN** 某菜品库存不足
- **THEN** 服务端返回 400 错误，message: "库存不足"，并指明哪个菜品

---

### Requirement: 获取用户订单列表接口
服务端 SHALL 提供获取用户历史订单的接口。

#### Scenario: 获取订单列表
- **WHEN** 客户端发送 `GET /api/v1/order/list`
- **THEN** 服务端返回当前用户的所有订单，按时间倒序

#### Scenario: 分页查询
- **WHEN** 客户端发送 `GET /api/v1/order/list?page=2&limit=10`
- **THEN** 服务端返回第 2 页的 10 条订单

---

### Requirement: 获取订单详情接口
服务端 SHALL 提供获取订单详情的接口。

#### Scenario: 获取订单详情
- **WHEN** 客户端发送 `GET /api/v1/order/:id`
- **THEN** 服务端返回订单详情，包含菜品列表、总价、状态、时间

#### Scenario: 无权限访问
- **WHEN** 用户访问不属于自己的订单
- **THEN** 服务端返回 403 错误

---

### Requirement: 微信支付接口
服务端 SHALL 提供发起微信支付的接口。

#### Scenario: 发起支付
- **WHEN** 客户端发送 `POST /api/v1/order/:id/pay`
- **THEN** 服务端调用微信支付统一下单 API，返回支付参数

#### Scenario: 订单已支付
- **WHEN** 用户对已支付订单再次发起支付
- **THEN** 服务端返回 400 错误，message: "订单已支付"

---

### Requirement: 微信支付回调接口
服务端 SHALL 提供微信支付结果回调接口。

#### Scenario: 支付成功回调
- **WHEN** 微信服务器发送 `POST /api/v1/payment/notify` 通知支付成功
- **THEN** 服务端验证签名，更新订单状态为已支付，返回成功响应

#### Scenario: 重复通知
- **WHEN** 微信服务器重复发送支付通知
- **THEN** 服务端幂等处理，返回成功响应

---

### Requirement: 商家菜谱管理接口
服务端 SHALL 提供商家管理菜谱的接口。

#### Scenario: 创建菜品
- **WHEN** 商家发送 `POST /api/v1/admin/menu`，携带菜品信息
- **THEN** 服务端创建菜品，返回菜品信息

#### Scenario: 更新菜品
- **WHEN** 商家发送 `PUT /api/v1/admin/menu/:id`
- **THEN** 服务端更新菜品信息

#### Scenario: 删除菜品
- **WHEN** 商家发送 `DELETE /api/v1/admin/menu/:id`
- **THEN** 服务端删除菜品

#### Scenario: 获取历史菜谱
- **WHEN** 商家发送 `GET /api/v1/admin/menu/history`
- **THEN** 服务端返回历史菜谱列表

---

### Requirement: 商家订单管理接口
服务端 SHALL 提供商家查看订单的接口。

#### Scenario: 获取今日订单
- **WHEN** 商家发送 `GET /api/v1/admin/order/today`
- **THEN** 服务端返回今日所有订单

#### Scenario: 获取订单统计
- **WHEN** 商家发送 `GET /api/v1/admin/order/stats`
- **THEN** 服务端返回今日订单数、已支付数、总收入、菜品汇总

#### Scenario: 导出订单
- **WHEN** 商家发送 `GET /api/v1/admin/order/export`
- **THEN** 服务端返回 Excel 文件

---

### Requirement: 图片上传接口
服务端 SHALL 提供图片上传接口。

#### Scenario: 上传图片
- **WHEN** 客户端发送 `POST /api/v1/upload/image`，携带图片文件
- **THEN** 服务端将图片上传至云存储，返回图片 URL

#### Scenario: 文件类型校验
- **WHEN** 客户端上传非图片文件
- **THEN** 服务端返回 400 错误，message: "只支持图片文件"

---

### Requirement: 权限控制
服务端 SHALL 对不同角色的用户进行权限控制。

#### Scenario: 用户接口鉴权
- **WHEN** 未登录用户访问需要认证的接口
- **THEN** 服务端返回 401 错误

#### Scenario: 商家接口鉴权
- **WHEN** 普通用户访问 /admin/* 接口
- **THEN** 服务端返回 403 错误

#### Scenario: Token 过期
- **WHEN** 用户使用过期的 Token
- **THEN** 服务端返回 401 错误，message: "Token 已过期"
