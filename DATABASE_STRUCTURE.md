# LED网站数据库结构文档
# LED Website Database Structure Documentation

## 概述 / Overview

本文档描述了LED B2B网站的增强版数据库结构，支持多语言内容管理、完整的产品管理系统、询盘跟进、内容管理和系统监控。

This document describes the enhanced database structure for the LED B2B website, supporting multilingual content management, comprehensive product management, inquiry tracking, content management, and system monitoring.

## 数据库版本 / Database Version

- **版本 / Version**: 2.0
- **数据库引擎 / Database Engine**: SQLite3
- **字符编码 / Character Encoding**: UTF-8
- **外键约束 / Foreign Key Constraints**: 启用 / Enabled

## 表结构 / Table Structure

### 1. 用户和认证 / Users and Authentication

#### users - 用户表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户ID / User ID |
| username | TEXT | UNIQUE NOT NULL | 用户名 / Username |
| email | TEXT | UNIQUE NOT NULL | 邮箱地址 / Email Address |
| password_hash | TEXT | NOT NULL | 密码哈希 / Password Hash |
| role | TEXT | DEFAULT 'admin' | 用户角色 / User Role |
| is_active | BOOLEAN | DEFAULT 1 | 是否激活 / Is Active |
| last_login | TIMESTAMP | | 最后登录时间 / Last Login Time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### user_sessions - 用户会话表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 会话ID / Session ID |
| user_id | INTEGER | NOT NULL, FK(users.id) | 用户ID / User ID |
| session_token | TEXT | NOT NULL | 会话令牌 / Session Token |
| expires_at | TIMESTAMP | NOT NULL | 过期时间 / Expires At |
| ip_address | TEXT | | IP地址 / IP Address |
| user_agent | TEXT | | 用户代理 / User Agent |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |

### 2. 产品管理系统 / Product Management System

#### product_categories - 产品分类表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 分类ID / Category ID |
| name_en | TEXT | NOT NULL | 英文名称 / English Name |
| name_zh | TEXT | NOT NULL | 中文名称 / Chinese Name |
| slug | TEXT | UNIQUE NOT NULL | URL别名 / URL Slug |
| description_en | TEXT | | 英文描述 / English Description |
| description_zh | TEXT | | 中文描述 / Chinese Description |
| parent_id | INTEGER | FK(product_categories.id) | 父分类ID / Parent Category ID |
| sort_order | INTEGER | DEFAULT 0 | 排序 / Sort Order |
| is_active | BOOLEAN | DEFAULT 1 | 是否激活 / Is Active |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### products - 产品表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 产品ID / Product ID |
| sku | TEXT | UNIQUE NOT NULL | 产品编码 / Product SKU |
| category_id | INTEGER | NOT NULL, FK(product_categories.id) | 分类ID / Category ID |
| name_en | TEXT | NOT NULL | 英文名称 / English Name |
| name_zh | TEXT | NOT NULL | 中文名称 / Chinese Name |
| description_en | TEXT | | 英文描述 / English Description |
| description_zh | TEXT | | 中文描述 / Chinese Description |
| specs_en | TEXT | | 英文规格(JSON) / English Specs (JSON) |
| specs_zh | TEXT | | 中文规格(JSON) / Chinese Specs (JSON) |
| price | DECIMAL(10,2) | | 价格 / Price |
| currency | TEXT | DEFAULT 'USD' | 货币 / Currency |
| pixel_pitch | TEXT | | 像素间距 / Pixel Pitch |
| brightness | INTEGER | | 亮度(nits) / Brightness (nits) |
| resolution | TEXT | | 分辨率 / Resolution |
| refresh_rate | INTEGER | | 刷新率(Hz) / Refresh Rate (Hz) |
| viewing_angle | TEXT | | 视角 / Viewing Angle |
| ip_rating | TEXT | | 防护等级 / IP Rating |
| power_consumption | DECIMAL(8,2) | | 功耗(W/m²) / Power Consumption (W/m²) |
| weight | DECIMAL(8,2) | | 重量(kg) / Weight (kg) |
| dimensions | TEXT | | 尺寸 / Dimensions |
| is_featured | BOOLEAN | DEFAULT 0 | 是否推荐 / Is Featured |
| is_active | BOOLEAN | DEFAULT 1 | 是否激活 / Is Active |
| sort_order | INTEGER | DEFAULT 0 | 排序 / Sort Order |
| meta_title_en | TEXT | | 英文SEO标题 / English SEO Title |
| meta_title_zh | TEXT | | 中文SEO标题 / Chinese SEO Title |
| meta_description_en | TEXT | | 英文SEO描述 / English SEO Description |
| meta_description_zh | TEXT | | 中文SEO描述 / Chinese SEO Description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### product_images - 产品图片表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 图片ID / Image ID |
| product_id | INTEGER | NOT NULL, FK(products.id) | 产品ID / Product ID |
| image_url | TEXT | NOT NULL | 图片URL / Image URL |
| alt_text_en | TEXT | | 英文替代文本 / English Alt Text |
| alt_text_zh | TEXT | | 中文替代文本 / Chinese Alt Text |
| is_primary | BOOLEAN | DEFAULT 0 | 是否主图 / Is Primary |
| sort_order | INTEGER | DEFAULT 0 | 排序 / Sort Order |
| file_size | INTEGER | | 文件大小(bytes) / File Size (bytes) |
| width | INTEGER | | 宽度 / Width |
| height | INTEGER | | 高度 / Height |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |

#### product_applications - 产品应用场景表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 应用ID / Application ID |
| product_id | INTEGER | NOT NULL, FK(products.id) | 产品ID / Product ID |
| application_en | TEXT | NOT NULL | 英文应用场景 / English Application |
| application_zh | TEXT | NOT NULL | 中文应用场景 / Chinese Application |
| sort_order | INTEGER | DEFAULT 0 | 排序 / Sort Order |

### 3. 询盘和线索管理 / Inquiry and Lead Management

#### inquiries - 询盘表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 询盘ID / Inquiry ID |
| name | TEXT | NOT NULL | 姓名 / Name |
| email | TEXT | NOT NULL | 邮箱 / Email |
| company | TEXT | | 公司 / Company |
| phone | TEXT | | 电话 / Phone |
| country | TEXT | | 国家 / Country |
| message | TEXT | NOT NULL | 留言 / Message |
| product_interest | TEXT | | 感兴趣的产品 / Product Interest |
| inquiry_type | TEXT | DEFAULT 'general' | 询盘类型 / Inquiry Type |
| status | TEXT | DEFAULT 'new' | 状态 / Status |
| priority | TEXT | DEFAULT 'normal' | 优先级 / Priority |
| source | TEXT | DEFAULT 'website' | 来源 / Source |
| assigned_to | INTEGER | FK(users.id) | 分配给 / Assigned To |
| estimated_value | DECIMAL(12,2) | | 预估价值 / Estimated Value |
| notes | TEXT | | 内部备注 / Internal Notes |
| language | TEXT | DEFAULT 'en' | 首选语言 / Preferred Language |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### inquiry_followups - 询盘跟进记录表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 跟进ID / Followup ID |
| inquiry_id | INTEGER | NOT NULL, FK(inquiries.id) | 询盘ID / Inquiry ID |
| user_id | INTEGER | NOT NULL, FK(users.id) | 用户ID / User ID |
| action_type | TEXT | NOT NULL | 行动类型 / Action Type |
| subject | TEXT | | 主题 / Subject |
| notes | TEXT | | 备注 / Notes |
| next_action | TEXT | | 下一步行动 / Next Action |
| next_action_date | DATE | | 下一步行动日期 / Next Action Date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |

### 4. 内容管理系统 / Content Management System

#### page_contents - 页面内容表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 内容ID / Content ID |
| page_key | TEXT | NOT NULL | 页面键 / Page Key |
| section_key | TEXT | NOT NULL | 区块键 / Section Key |
| content_en | TEXT | | 英文内容 / English Content |
| content_zh | TEXT | | 中文内容 / Chinese Content |
| content_type | TEXT | DEFAULT 'text' | 内容类型 / Content Type |
| is_active | BOOLEAN | DEFAULT 1 | 是否激活 / Is Active |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### news_articles - 新闻文章表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 文章ID / Article ID |
| title_en | TEXT | NOT NULL | 英文标题 / English Title |
| title_zh | TEXT | NOT NULL | 中文标题 / Chinese Title |
| slug_en | TEXT | UNIQUE NOT NULL | 英文URL别名 / English URL Slug |
| slug_zh | TEXT | UNIQUE NOT NULL | 中文URL别名 / Chinese URL Slug |
| content_en | TEXT | | 英文内容 / English Content |
| content_zh | TEXT | | 中文内容 / Chinese Content |
| excerpt_en | TEXT | | 英文摘要 / English Excerpt |
| excerpt_zh | TEXT | | 中文摘要 / Chinese Excerpt |
| featured_image | TEXT | | 特色图片 / Featured Image |
| author_id | INTEGER | FK(users.id) | 作者ID / Author ID |
| category | TEXT | | 分类 / Category |
| tags | TEXT | | 标签(JSON) / Tags (JSON) |
| is_published | BOOLEAN | DEFAULT 0 | 是否发布 / Is Published |
| is_featured | BOOLEAN | DEFAULT 0 | 是否推荐 / Is Featured |
| published_at | TIMESTAMP | | 发布时间 / Published At |
| meta_title_en | TEXT | | 英文SEO标题 / English SEO Title |
| meta_title_zh | TEXT | | 中文SEO标题 / Chinese SEO Title |
| meta_description_en | TEXT | | 英文SEO描述 / English SEO Description |
| meta_description_zh | TEXT | | 中文SEO描述 / Chinese SEO Description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### cases - 案例研究表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 案例ID / Case ID |
| title_en | TEXT | NOT NULL | 英文标题 / English Title |
| title_zh | TEXT | NOT NULL | 中文标题 / Chinese Title |
| slug_en | TEXT | UNIQUE NOT NULL | 英文URL别名 / English URL Slug |
| slug_zh | TEXT | UNIQUE NOT NULL | 中文URL别名 / Chinese URL Slug |
| client | TEXT | | 客户 / Client |
| location | TEXT | | 地点 / Location |
| country | TEXT | | 国家 / Country |
| project_date | DATE | | 项目日期 / Project Date |
| project_value | DECIMAL(12,2) | | 项目价值 / Project Value |
| currency | TEXT | DEFAULT 'USD' | 货币 / Currency |
| description_en | TEXT | | 英文描述 / English Description |
| description_zh | TEXT | | 中文描述 / Chinese Description |
| challenge_en | TEXT | | 英文挑战 / English Challenge |
| challenge_zh | TEXT | | 中文挑战 / Chinese Challenge |
| solution_en | TEXT | | 英文解决方案 / English Solution |
| solution_zh | TEXT | | 中文解决方案 / Chinese Solution |
| results_en | TEXT | | 英文结果 / English Results |
| results_zh | TEXT | | 中文结果 / Chinese Results |
| featured_image | TEXT | | 特色图片 / Featured Image |
| industry | TEXT | | 行业 / Industry |
| products_used | TEXT | | 使用的产品(JSON) / Products Used (JSON) |
| is_featured | BOOLEAN | DEFAULT 0 | 是否推荐 / Is Featured |
| is_published | BOOLEAN | DEFAULT 1 | 是否发布 / Is Published |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### case_images - 案例图片表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 图片ID / Image ID |
| case_id | INTEGER | NOT NULL, FK(cases.id) | 案例ID / Case ID |
| image_url | TEXT | NOT NULL | 图片URL / Image URL |
| caption_en | TEXT | | 英文说明 / English Caption |
| caption_zh | TEXT | | 中文说明 / Chinese Caption |
| sort_order | INTEGER | DEFAULT 0 | 排序 / Sort Order |

### 5. 系统设置和配置 / System Settings and Configuration

#### system_settings - 系统设置表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 设置ID / Setting ID |
| setting_key | TEXT | UNIQUE NOT NULL | 设置键 / Setting Key |
| setting_value | TEXT | | 设置值 / Setting Value |
| setting_type | TEXT | DEFAULT 'text' | 设置类型 / Setting Type |
| description | TEXT | | 描述 / Description |
| is_public | BOOLEAN | DEFAULT 0 | 是否公开 / Is Public |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 / Updated At |

#### activity_logs - 活动日志表
| 字段 / Field | 类型 / Type | 约束 / Constraints | 描述 / Description |
|-------------|------------|-------------------|-------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 日志ID / Log ID |
| user_id | INTEGER | FK(users.id) | 用户ID / User ID |
| action | TEXT | NOT NULL | 行动 / Action |
| table_name | TEXT | | 表名 / Table Name |
| record_id | INTEGER | | 记录ID / Record ID |
| old_values | TEXT | | 旧值(JSON) / Old Values (JSON) |
| new_values | TEXT | | 新值(JSON) / New Values (JSON) |
| ip_address | TEXT | | IP地址 / IP Address |
| user_agent | TEXT | | 用户代理 / User Agent |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 / Created At |

## 索引 / Indexes

为了提高查询性能，创建了以下索引：

- `idx_products_category` - 产品分类索引
- `idx_products_sku` - 产品SKU索引
- `idx_products_featured` - 推荐产品索引
- `idx_products_active` - 激活产品索引
- `idx_inquiries_status` - 询盘状态索引
- `idx_inquiries_created` - 询盘创建时间索引
- `idx_inquiries_assigned` - 询盘分配索引
- `idx_inquiries_email` - 询盘邮箱索引
- `idx_sessions_token` - 会话令牌索引
- `idx_sessions_expires` - 会话过期时间索引
- `idx_page_contents_page` - 页面内容索引
- `idx_news_published` - 新闻发布索引
- `idx_cases_featured` - 推荐案例索引

## 默认数据 / Default Data

### 产品分类 / Product Categories
1. Fine Pitch LED / 小间距LED显示屏
2. Outdoor LED / 户外LED显示屏
3. Rental LED / 租赁LED显示屏
4. Creative LED / 创意LED显示屏
5. Transparent LED / 透明LED显示屏
6. Interactive LED / 交互LED显示屏

### 系统设置 / System Settings
- 公司名称（中英文）
- 联系邮箱和电话
- 公司地址（中英文）
- 默认语言设置
- 分页设置
- 文件上传限制

### 页面内容 / Page Contents
- 首页英雄区标题和副标题
- 关于我们页面公司介绍

## API端点 / API Endpoints

### 公开API / Public APIs
- `GET /api/products` - 获取产品列表
- `GET /api/products/{id}` - 获取单个产品
- `GET /api/product-categories` - 获取产品分类
- `GET /api/cases` - 获取案例列表
- `GET /api/page-content/{page_key}` - 获取页面内容
- `GET /api/settings/public` - 获取公开设置
- `POST /api/contact` - 提交联系表单

### 管理员API / Admin APIs
- `GET /api/admin/dashboard-stats` - 获取仪表板统计
- `GET /api/admin/inquiries` - 获取询盘列表
- `GET /api/admin/inquiries/{id}` - 获取单个询盘
- `PUT /api/admin/inquiries/{id}/status` - 更新询盘状态
- `POST /api/admin/inquiries/{id}/followup` - 添加跟进记录

## 数据库维护 / Database Maintenance

### 备份策略 / Backup Strategy
- 每日自动备份数据库文件
- 重要操作前创建备份点
- 保留最近30天的备份文件

### 性能优化 / Performance Optimization
- 定期分析查询性能
- 优化慢查询
- 清理过期的会话数据
- 压缩活动日志

### 安全措施 / Security Measures
- 启用外键约束
- 使用参数化查询防止SQL注入
- 密码使用安全哈希算法
- 记录所有重要操作的审计日志

## 版本历史 / Version History

### v2.0 (2024-08-11)
- 完整的多语言支持
- 增强的产品管理系统
- 询盘跟进和状态管理
- 内容管理系统
- 系统监控和日志记录
- 性能优化索引

### v1.0 (Initial)
- 基础的产品、询盘、用户和案例表
- 简单的数据结构
- 基本的管理功能

---

如有问题或需要进一步的技术支持，请联系开发团队。
For questions or technical support, please contact the development team.