-- ============================================
-- AI课后总结助手 - 行为数据分析系统
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 表1: 生成日志
CREATE TABLE IF NOT EXISTS generation_logs (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  input_text      TEXT,
  input_length    INT,
  used_voice      BOOLEAN DEFAULT FALSE,
  subject         TEXT,
  output_text     TEXT,
  generation_ms   INT,
  copied          BOOLEAN DEFAULT FALSE,
  copy_delay_ms   INT,
  iteration_count INT DEFAULT 0,
  completed       BOOLEAN DEFAULT FALSE
);

-- 表2: 行为日志
CREATE TABLE IF NOT EXISTS action_logs (
  id              BIGSERIAL PRIMARY KEY,
  generation_id   BIGINT REFERENCES generation_logs(id),
  action_type     TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_copied ON generation_logs(copied);
CREATE INDEX IF NOT EXISTS idx_action_logs_generation_id ON action_logs(generation_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_action_type ON action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON action_logs(created_at DESC);

-- 2026-05-25: action_logs 加 metadata 列，存储修改意见等扩展信息
ALTER TABLE action_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 开启 RLS 但允许 service_role 全权限
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
