// シンプルな疑似ジョブ実装（本番は BullMQ + Redis を推奨）
import pLimit from "p-limit";

const limit = pLimit(1); // 直列処理（並列したければ数を増やす）

type Runner = (jobId: string) => Promise<void>;
const runners = new Map<string, Runner>();

export function registerRunner(jobId: string, fn: Runner) {
  runners.set(jobId, fn);
}

export async function runJob(jobId: string) {
  const fn = runners.get(jobId);
  if (!fn) return;
  await limit(() => fn(jobId));
  runners.delete(jobId);
}