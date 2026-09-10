"use client";

import { useEffect, useState } from "react";
import {
  clearByot,
  readByot,
  writeByot,
  type Byot,
} from "@/lib/byot";
import { useTranslation } from "@/lib/i18n";

/**
 * ByotPanel — "Bring your own token" manager for the AI Lab live demos.
 *
 * Visitors paste their own OpenAI-compatible chat key and/or Fish Audio key;
 * the keys are stored only in their browser (localStorage) and attached to
 * their own demo requests. The site's server keys are never involved.
 */
export default function ByotPanel() {
  const { lang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [chatKey, setChatKey] = useState("");
  const [chatUrl, setChatUrl] = useState("");
  const [chatModel, setChatModel] = useState("");
  const [fishKey, setFishKey] = useState("");
  const [fishVoice, setFishVoice] = useState("");
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored: Byot = readByot();
    setChatKey(stored.chat?.key ?? "");
    setChatUrl(stored.chat?.url ?? "");
    setChatModel(stored.chat?.model ?? "");
    setFishKey(stored.fish?.key ?? "");
    setFishVoice(stored.fish?.voiceId ?? "");
    setLoaded(true);
  }, []);

  function save() {
    writeByot({
      chat: chatKey.trim()
        ? { key: chatKey.trim(), url: chatUrl.trim(), model: chatModel.trim() }
        : undefined,
      fish: fishKey.trim()
        ? { key: fishKey.trim(), voiceId: fishVoice.trim() }
        : undefined,
    });
    const has = readByot();
    setStatus(
      lang === "zh"
        ? `已保存到本浏览器 ✓（聊天密钥：${has.chat ? "已配置" : "未设置"} · 语音密钥：${has.fish ? "已配置" : "未设置"}）`
        : `Saved to this browser ✓ (chat key: ${has.chat ? "configured" : "not set"} · voice key: ${has.fish ? "configured" : "not set"})`
    );
  }

  function remove() {
    clearByot();
    setChatKey("");
    setChatUrl("");
    setChatModel("");
    setFishKey("");
    setFishVoice("");
    setStatus(
      lang === "zh" ? "已清除本浏览器中的密钥。" : "Keys removed from this browser."
    );
  }

  const label = lang === "zh" ? "自带密钥（BYOT）" : "Bring your own token (BYOT)";
  const chatLabel = lang === "zh" ? "聊天 / LLM 密钥" : "Chat / LLM key";
  const urlLabel = lang === "zh" ? "API 地址（可选）" : "API base URL (optional)";
  const modelLabel = lang === "zh" ? "模型（可选）" : "Model (optional)";
  const voiceLabel = lang === "zh" ? "Fish Audio 密钥" : "Fish Audio key";
  const voiceIdLabel = lang === "zh" ? "音色 ID（可选）" : "Voice ID (optional)";
  const saveLabel = lang === "zh" ? "保存" : "Save";
  const removeLabel = lang === "zh" ? "清除" : "Remove";
  const hint =
    lang === "zh"
      ? "适用于任何 OpenAI 兼容接口：OpenAI、Groq（https://api.groq.com/openai/v1）、OpenRouter、本地 vLLM 等。语音密钥用于 TTS 工作室；两者也会驱动右下角的语音助手。"
      : "Works with any OpenAI-compatible API: OpenAI, Groq (https://api.groq.com/openai/v1), OpenRouter, a local vLLM, etc. The voice key powers the TTS studio; both also drive the popup voice agent.";
  const privacy =
    lang === "zh"
      ? "密钥只保存在你的浏览器本地，仅随你自己的演示请求发送，绝不会存储在本站服务器上。"
      : "Keys stay in your browser's local storage, are sent only with your own demo requests, and are never stored on this site's servers.";

  return (
    <div className="mb-4 rounded-lg border border-dashed border-line bg-paper">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-ink">
          {label}
          {loaded && (readByot().chat || readByot().fish) ? (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {lang === "zh" ? "已配置" : "configured"}
            </span>
          ) : null}
        </span>
        <span className="text-xs text-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent">
              {chatLabel}
            </label>
            <input
              type="password"
              value={chatKey}
              onChange={(e) => setChatKey(e.target.value)}
              autoComplete="off"
              placeholder="sk-…"
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={chatUrl}
                onChange={(e) => setChatUrl(e.target.value)}
                placeholder={urlLabel}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-accent"
              />
              <input
                type="text"
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value)}
                placeholder={modelLabel}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent">
              {voiceLabel}
            </label>
            <input
              type="password"
              value={fishKey}
              onChange={(e) => setFishKey(e.target.value)}
              autoComplete="off"
              placeholder="fa-…"
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <input
              type="text"
              value={fishVoice}
              onChange={(e) => setFishVoice(e.target.value)}
              placeholder={voiceIdLabel}
              className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            >
              {saveLabel}
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-md border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted transition-colors hover:text-ink"
            >
              {removeLabel}
            </button>
          </div>

          {status && <p className="text-xs font-medium text-emerald-700">{status}</p>}
          <p className="text-xs leading-relaxed text-muted">{hint}</p>
          <p className="text-xs leading-relaxed text-muted">🔒 {privacy}</p>
        </div>
      )}
    </div>
  );
}
