"use client";

import Link from "next/link";
import { ArrowLeft, Database, FlaskConical, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { InfraTechnicalCard, InfraTechnicalHeading } from "@/components/InfraTechnicalCard";
import { estimateDailyProduction } from "@/daily-production";
import { costBetween, maxLevel, type EliteStage } from "@/leveling-costs";
import { useWorkbench } from "@/workbench-context";

const fmt = (value: number) => Math.round(value).toLocaleString("zh-CN");

export default function UpgradeCyclePage() {
  const [star, setStar] = useState(6);
  const [fromElite, setFromElite] = useState<EliteStage>(0);
  const [fromLevel, setFromLevel] = useState(1);
  const [toElite, setToElite] = useState<EliteStage>(2);
  const [toLevel, setToLevel] = useState(60);
  const { calculator } = useWorkbench();
  const dailyProduction = useMemo(() => {
    const schedule = calculator.scheduleResult;
    if (!schedule) return null;
    return estimateDailyProduction({ layout: calculator.layout, maa: schedule.maa, rotation: schedule.rotation });
  }, [calculator.layout, calculator.scheduleResult]);
  const dailyLmd = dailyProduction?.lmdOrders.value ?? null;
  const dailyExp = dailyProduction?.experience.value ?? null;

  const result = useMemo(() => costBetween(star, fromElite, fromLevel, toElite, toLevel), [star, fromElite, fromLevel, toElite, toLevel]);
  const expDays = result && dailyExp != null && dailyExp > 0 ? Math.ceil(result.exp / dailyExp) : null;
  const lmdDays = result && dailyLmd != null && dailyLmd > 0 ? Math.ceil(result.totalLmd / dailyLmd) : null;
  const cycleDays = expDays != null && lmdDays != null ? Math.max(expDays, lmdDays) : null;

  function changeFromElite(value: EliteStage) {
    setFromElite(value);
    setFromLevel(Math.min(fromLevel, maxLevel(star, value)));
  }

  function changeToElite(value: EliteStage) {
    setToElite(value);
    setToLevel(Math.min(toLevel, maxLevel(star, value)));
  }

  function changeStar(value: number) {
    const targetElite = Math.min(2, value >= 4 ? 2 : 1) as EliteStage;
    setStar(value);
    setFromElite(0);
    setFromLevel(1);
    setToElite(targetElite);
    setToLevel(Math.min(60, maxLevel(value, targetElite)));
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-8 pt-5 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2.5 text-lg font-semibold">
              <span className="h-6 w-1.5 bg-[#FFD501]" aria-hidden="true" />
              提升周期
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">纯培养资源估算，不计算回本收益。</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://prts.wiki/w/%E5%B9%B2%E5%91%98%E5%8D%87%E7%BA%A7%E6%95%B0%E5%80%BC" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-border px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Database className="size-4" />Wiki 数据</a>
            <Link href="/" aria-label="返回基建终端" className="grid size-11 place-items-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><ArrowLeft className="size-5" /></Link>
          </div>
        </header>

        <InfraTechnicalCard group="training" dataSlot="upgrade-cycle" showEmblem={false} className="p-5 sm:p-6">
          <InfraTechnicalHeading icon={<FlaskConical className="size-4" />}>CULTIVATION COST</InfraTechnicalHeading>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-2xl font-semibold">练度区间</h2><p className="mt-2 text-sm text-white/62">读取每日经验和龙门币产量，计算纯培养完成周期。</p></div>
            <div className="inline-flex min-h-10 items-center gap-2 border border-[var(--room-accent)]/55 bg-black/20 px-3 text-xs text-white/80"><ShieldCheck className="size-4 text-[var(--room-accent)]" />不消耗理智</div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1.5 text-xs text-white/62">星级<select value={star} onChange={(event) => changeStar(Number(event.target.value))} className="h-11 border border-white/15 bg-black/20 px-3 text-sm text-white outline-none focus:border-[var(--room-accent)]"><option value={3}>3★</option><option value={4}>4★</option><option value={5}>5★</option><option value={6}>6★</option></select></label>
            <div className="grid gap-1.5 text-xs text-white/62"><span>计算器每日龙门币</span><div className="flex h-11 items-center border border-white/15 bg-black/20 px-3 text-sm text-white">{dailyLmd == null ? "等待排班结果" : fmt(dailyLmd)}</div></div>
            <div className="grid gap-1.5 text-xs text-white/62"><span>计算器每日经验</span><div className="flex h-11 items-center border border-white/15 bg-black/20 px-3 text-sm text-white">{dailyExp == null ? "等待排班结果" : fmt(dailyExp)}</div></div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-white/12 pt-5 sm:grid-cols-2">
            <div className="grid gap-2"><p className="text-xs text-white/62">当前练度</p><div className="grid grid-cols-2 gap-2"><select value={fromElite} onChange={(event) => changeFromElite(Number(event.target.value) as EliteStage)} className="h-11 border border-white/15 bg-black/20 px-3 text-sm text-white outline-none focus:border-[var(--room-accent)]"><option value={0}>精0</option><option value={1}>精1</option>{star >= 4 ? <option value={2}>精2</option> : null}</select><input type="number" min={1} max={maxLevel(star, fromElite)} value={fromLevel} onChange={(event) => setFromLevel(Math.min(maxLevel(star, fromElite), Math.max(1, Number(event.target.value) || 1)))} className="h-11 border border-white/15 bg-black/20 px-3 text-sm text-white outline-none focus:border-[var(--room-accent)]" aria-label="当前等级" /></div></div>
            <div className="grid gap-2"><p className="text-xs text-white/62">目标练度</p><div className="grid grid-cols-2 gap-2"><select value={toElite} onChange={(event) => changeToElite(Number(event.target.value) as EliteStage)} className="h-11 border border-white/15 bg-black/20 px-3 text-sm text-white outline-none focus:border-[var(--room-accent)]"><option value={0}>精0</option><option value={1}>精1</option>{star >= 4 ? <option value={2}>精2</option> : null}</select><input type="number" min={1} max={maxLevel(star, toElite)} value={toLevel} onChange={(event) => setToLevel(Math.min(maxLevel(star, toElite), Math.max(1, Number(event.target.value) || 1)))} className="h-11 border border-white/15 bg-black/20 px-3 text-sm text-white outline-none focus:border-[var(--room-accent)]" aria-label="目标等级" /></div></div>
          </div>

          {result ? <div className="mt-6 grid gap-px bg-white/12 sm:grid-cols-4">
            {[['所需经验', result.exp], ['升级龙门币', result.lmd], ['精英化龙门币', result.promotionLmd], ['总龙门币', result.totalLmd]].map(([label, value]) => <div key={String(label)} className="bg-black/25 p-4"><p className="text-xs text-white/58">{label}</p><strong className="mt-1 block text-2xl font-semibold text-[var(--room-accent)]">{fmt(Number(value))}</strong></div>)}
          </div> : <p className="mt-6 border border-amber-300/40 bg-amber-100/10 px-3 py-3 text-sm text-amber-100">目标练度必须不低于当前练度。</p>}

          {cycleDays != null ? <div className="mt-4 overflow-hidden border border-white/12 bg-black/20"><div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-white/12 px-3 py-2 text-xs text-white/55 sm:px-4"><span>资源</span><span className="text-right">所需</span><span className="text-right">每日产量</span><span className="text-right">至多需要</span></div><div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center border-b border-white/8 px-3 py-3 text-sm sm:px-4"><span className="font-medium text-white">所需经验</span><strong className="text-right text-[var(--room-accent)]">{fmt(result.exp)}</strong><span className="text-right text-white/75">{fmt(dailyExp)}</span><strong className="text-right text-white">{expDays} 天</strong></div><div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center px-3 py-3 text-sm sm:px-4"><span className="font-medium text-white">完成龙门币需求</span><strong className="text-right text-[var(--room-accent)]">{fmt(result.totalLmd)}</strong><span className="text-right text-white/75">{fmt(dailyLmd)}</span><strong className="text-right text-white">{lmdDays} 天</strong></div><div className="border-t border-[var(--room-accent)]/25 bg-[var(--room-accent)]/8 px-3 py-3 text-right text-sm text-white/75 sm:px-4">最终完成周期：<strong className="text-lg text-[var(--room-accent)]">{cycleDays} 天</strong></div></div> : <p className="mt-4 border border-amber-300/40 bg-amber-100/10 px-3 py-3 text-sm text-amber-100">请先在基建计算器生成排班结果，页面会自动读取每日经验和龙门币产量。</p>}
        </InfraTechnicalCard>
      </div>
    </main>
  );
}
