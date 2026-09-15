const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.siteSettings
  .findUnique({ where: { id: 'global' } })
  .then((s) => {
    console.log(
      JSON.stringify({
        aiProvider: s && s.aiProvider,
        aiModel: s && s.aiModel,
        imageProvider: s && s.imageProvider,
        imageModel: s && s.imageModel,
        imageStyle: s && s.imageStyle,
        imageFallback: s && s.imageFallback,
        hasOpenAI: !!(s && s.openaiApiKey),
        hasGemini: !!(s && s.geminiApiKey),
        autoPublish: s && s.autoPublish,
      })
    );
    return p.disconnect();
  })
  .catch((e) => {
    console.error('ERR', e.message);
    process.exit(1);
  });
