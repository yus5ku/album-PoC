import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 既存ならスキップ
  const provider = "line";
  const providerId = "demo-line-sub-123";

  let user = await prisma.user.findFirst({ where: { provider, providerId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        provider,
        providerId,
        name: "Demo User",
        imageUrl: null
      }
    });
  }

  // デモ用アルバム
  let album = await prisma.album.findFirst({
    where: { ownerId: user.id, title: "Getting Started" }
  });
  if (!album) {
    album = await prisma.album.create({
      data: {
        ownerId: user.id,
        title: "Getting Started",
        description: "最初のアルバム（デモ）",
        isPublic: false
      }
    });
  }

  // デモ用メディア（実ファイルは無し、キーだけ）
  const exists = await prisma.media.findFirst({ where: { albumId: album.id } });
  if (!exists) {
    await prisma.media.create({
      data: {
        albumId: album.id,
        ownerId: user.id,
        storageKey: "local:demo/hello.txt",
        mime: "text/plain",
        caption: "ようこそ！",
        tags: ["demo", "hello"] // Json配列
      }
    });
  }

  console.log("Seed completed:", { userId: user.id, albumId: album.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });