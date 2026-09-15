const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.siteSettings
  .update({
    where: { id: 'global' },
    data: {
      aiProvider: 'openai',
      imageProvider: 'openai',
      imageModel: 'gpt-image-1',
      imageStyle: 'editorial',
      imageFallback: 'placeholder',
    },
  })
  .then((s) => {
    console.log(
      'UPDATED ' +
        JSON.stringify({
          aiProvider: s.aiProvider,
          aiModel: s.aiModel,
          imageProvider: s.imageProvider,
          imageModel: s.imageModel,
          imageStyle: s.imageStyle,
          imageFallback: s.imageFallback,
        })
    );
    return p.disconnect();
  })
  .catch((e) => {
    console.log('FAIL ' + e.message);
  });