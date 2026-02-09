一、C 端小程序需求文档（用户端）

1. 核心功能

功能模块	需求描述	备注
登录/注册	使用微信授权登录，获取用户信息	可以扩展手机号绑定
选择菜品	可勾选菜品，填写数量	每人限额可配置
提交订单	提交点单，显示总价	支持限时截止，超过时间禁止提交
支付	支付宝/微信支付接口	支付完成后状态更新为已支付
历史订单	查看自己的历史点餐记录，包括已支付和未支付订单	支持按日期查询
提醒/倒计时	菜单截止时间倒计时提醒	可用小程序订阅消息推送
用户设置	修改昵称、头像、通知偏好	可选

2. 页面设计
	1.	首页：今日菜单+倒计时+快速下单按钮
	2.	菜品详情页：菜品图片、价格、简介、库存
	3.	订单页：已选菜品列表、数量修改、总价、提交按钮
	4.	支付页：支付方式选择、支付状态展示
	5.	历史订单页：订单列表、订单详情

⸻

二、B 端小程序需求文档（商家端）

1. 核心功能

功能模块	需求描述	备注
登录/权限管理	微信扫码或账号密码登录	可做管理员/操作员区分
菜谱管理	上传每日菜谱（菜名、图片、价格、库存、截止时间）	支持修改、删除
订单管理	查看每日订单列表、订单详情（用户信息、菜品、数量、支付状态）	支持导出Excel或打印
菜谱历史	查看历史菜谱	可对比销量和受欢迎菜品
通知管理	可推送消息给用户（例如菜品售罄提醒）	使用订阅消息

2. 页面设计
	1.	首页：今日订单汇总、待处理订单提醒
	2.	菜谱管理页：上传/编辑今日菜谱、截止时间设置
	3.	订单详情页：用户点单明细、支付状态、备注
	4.	历史菜谱页：历史菜谱列表、销量统计

⸻

三、服务端设计

1. 核心接口

接口	请求方式	功能
/login	POST	微信授权登录
/menu/today	GET	获取当天菜谱
/menu/history	GET	获取历史菜谱
/order/create	POST	提交订单
/order/list	GET	用户历史订单
/order/detail	GET	获取订单详情
/order/pay	POST	支付接口回调
/admin/menu/create	POST	商家上传菜谱
/admin/menu/list	GET	商家查看历史菜谱
/admin/order/list	GET	商家查看当日订单
/admin/notify	POST	商家推送通知

2. 服务端逻辑
	•	订单截止时间控制：提交接口需检查当前时间 < 截止时间
	•	库存控制：提交订单时扣减库存，超库存提示用户
	•	支付回调：支付成功更新订单状态为已支付
	•	权限控制：C 端只能访问自己订单、B 端只能管理菜谱和订单

⸻

四、数据库设计

1. 用户表（users）

字段	类型	说明
id	bigint PK	用户ID
openid	varchar	微信openid
nickname	varchar	昵称
avatar	varchar	头像
created_at	datetime	创建时间

2. 菜谱表（menus）

字段	类型	说明
id	bigint PK	菜谱ID
date	date	菜单日期
name	varchar	菜名
price	decimal	单价
image	varchar	图片URL
stock	int	库存数量
cutoff_time	datetime	截止时间
created_at	datetime	创建时间
updated_at	datetime	更新时间

3. 订单表（orders）

字段	类型	说明
id	bigint PK	订单ID
user_id	bigint FK	用户ID
total_price	decimal	总价
status	tinyint	0未支付 1已支付 2已取消
created_at	datetime	下单时间
paid_at	datetime	支付时间
cutoff_time	datetime	截止时间（冗余便于查询）

4. 订单详情表（order_items）

字段	类型	说明
id	bigint PK	明细ID
order_id	bigint FK	订单ID
menu_id	bigint FK	菜谱ID
quantity	int	数量
price	decimal	单价

5. 商家表（merchants，可选）

字段	类型	说明
id	bigint PK	商家ID
name	varchar	商家名
account	varchar	登录账号
password	varchar	密码（加密）


⸻

五、技术选型建议
	•	小程序框架：微信原生 + Taro/UniApp 可选
	•	服务端：Node.js + Koa/Express 或 Python FastAPI
	•	数据库：MySQL 或 PostgreSQL
	•	支付：微信支付小程序接口
	•	存储图片：OSS/七牛/腾讯云COS

