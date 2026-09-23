-- Tone Market: catálogo e mídias iniciais para uma base PostgreSQL nova.
-- Execute APÓS a migração 0000_far_sir_ram.sql. O script não cria usuários,
-- sessões ou eventos analíticos históricos.

BEGIN;

INSERT INTO "products" ("id", "name", "slug", "category", "description", "specifications", "priceCents", "condition", "available", "sold", "promotionActive", "promotionEndsAt", "createdAt", "updatedAt")
OVERRIDING SYSTEM VALUE VALUES
  (1, 'Fender American Ultra Luxe', 'fender-american-ultra-luxe', 'Guitarras', 'Fender American Ultra Luxe em estado impecável. Acompanha nota fiscal. Entre em contato pelo WhatsApp para confirmar detalhes, pagamento e retirada em Cuiabá.', NULL, 3000000, 'new', 1, 0, 0, NULL, '2026-08-13 00:05:57+00', '2026-08-13 00:05:57+00'),
  (30001, 'TESTE — Guitarra rubi', 'teste-guitarra-rubi', 'Guitarras', 'Ativo de teste para fotos e edição. Pode ser alterado ou removido no painel.', 'Item de demonstração. Gerencie fotos, disponibilidade e dados livremente.', NULL, 'new', 1, 0, 1, '2026-09-12 16:57:52+00', '2026-08-13 04:36:37+00', '2026-08-13 16:57:52+00'),
  (30002, 'TESTE — Violão âmbar', 'teste-violao-ambar', 'Violões', 'Ativo de teste para fotos e edição. Pode ser alterado ou removido no painel.', 'Item de demonstração. Gerencie fotos, disponibilidade e dados livremente.', NULL, 'new', 1, 0, 0, NULL, '2026-08-13 04:36:37+00', '2026-08-13 04:49:26+00'),
  (30003, 'TESTE — Pedalboard violeta', 'teste-pedalboard-violeta', 'Pedais', 'Ativo de teste para fotos e edição. Pode ser alterado ou removido no painel.', 'Item de demonstração. Gerencie fotos, disponibilidade e dados livremente.', 500000, 'used', 0, 1, 0, NULL, '2026-08-13 04:36:37+00', '2026-08-13 17:08:57+00')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "productImages" ("id", "productId", "storageKey", "url", "sortOrder", "createdAt")
OVERRIDING SYSTEM VALUE VALUES
  (1, 1, 'fender-american-ultra-luxe_2b4cfab1.jpg', '/media/fender-american-ultra-luxe_2b4cfab1.jpg', 0, '2026-08-13 00:05:57+00'),
  (30001, 30001, 'tone-test-electric-guitar_b06a1d37.jpg', '/media/tone-test-electric-guitar_b06a1d37.jpg', 0, '2026-08-13 04:36:37+00'),
  (60001, 30001, 'tone-test-electric-guitar-3-4-front_9e8795dc.png', '/media/tone-test-electric-guitar-3-4-front_9e8795dc.png', 1, '2026-08-13 14:24:39+00'),
  (60002, 30001, 'tone-test-electric-guitar-back_59d8372b.png', '/media/tone-test-electric-guitar-back_59d8372b.png', 2, '2026-08-13 14:24:39+00'),
  (60003, 30001, 'tone-test-electric-guitar-hardware-detail_c847509f.png', '/media/tone-test-electric-guitar-hardware-detail_c847509f.png', 3, '2026-08-13 14:24:39+00'),
  (60004, 30001, 'tone-test-electric-guitar-headstock-detail_12402aca.png', '/media/tone-test-electric-guitar-headstock-detail_12402aca.png', 4, '2026-08-13 14:24:40+00'),
  (30002, 30002, 'tone-test-acoustic-guitar_f341f228.jpg', '/media/tone-test-acoustic-guitar_f341f228.jpg', 0, '2026-08-13 04:36:37+00'),
  (30003, 30003, 'tone-test-pedal-rig_53bb84fb.jpg', '/media/tone-test-pedal-rig_53bb84fb.jpg', 0, '2026-08-13 04:36:37+00')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "productVideos" ("id", "productId", "kind", "title", "description", "country", "storageKey", "url", "consentConfirmed", "published", "sortOrder", "createdAt", "updatedAt")
OVERRIDING SYSTEM VALUE VALUES
  (1, 1, 'demo', 'Demonstração de guitarra — nova sessão', 'Demonstração com execução de guitarra e áudio para apresentar dinâmica, timbre e detalhes do instrumento.', 'Brasil', '/media/tone-guitar-demo-refresh_87da4ffe.mp4', '/media/tone-guitar-demo-refresh_87da4ffe.mp4', 1, 1, 0, '2026-08-20 18:20:00+00', '2026-08-20 18:20:00+00'),
  (30001, NULL, 'demo', 'TESTE — Demonstração de guitarra atualizada', 'Vídeo de teste atualizado para experimentar publicação, edição e remoção no painel.', NULL, 'tone-guitar-demo-refresh_87da4ffe.mp4', '/media/tone-guitar-demo-refresh_87da4ffe.mp4', 1, 0, 99, '2026-08-20 18:30:00+00', '2026-08-20 18:30:00+00')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ambientTracks" ("id", "context", "title", "description", "storageKey", "url", "active", "isTest", "createdAt", "updatedAt")
OVERRIDING SYSTEM VALUE VALUES
  (1, 'guitar', 'Teste — Guitarras leves', 'Faixa de teste para guitarras elétricas. Pode ser substituída ou removida.', 'tone-electric-guitar-context_63a3e573.mp3', '/media/tone-electric-guitar-context_63a3e573.mp3', 1, 1, '2026-08-13 04:36:36+00', '2026-08-13 04:36:36+00'),
  (2, 'acoustic', 'Teste — Violão leve', 'Faixa de teste para violões. Pode ser substituída ou removida.', 'tone-acoustic-guitar-context_dfc7a9d1.mp3', '/media/tone-acoustic-guitar-context_dfc7a9d1.mp3', 1, 1, '2026-08-13 04:36:36+00', '2026-08-13 04:36:36+00'),
  (3, 'effects', 'Teste — Efeitos e amplificadores', 'Faixa de teste para pedais e amplificadores. Pode ser substituída ou removida.', 'tone-effects-amp-context_a4eed5be.mp3', '/media/tone-effects-amp-context_a4eed5be.mp3', 1, 1, '2026-08-13 04:36:36+00', '2026-08-13 04:36:36+00')
ON CONFLICT ("id") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"products"', 'id'), GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "products"), 1), true);
SELECT setval(pg_get_serial_sequence('"productImages"', 'id'), GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "productImages"), 1), true);
SELECT setval(pg_get_serial_sequence('"productVideos"', 'id'), GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "productVideos"), 1), true);
SELECT setval(pg_get_serial_sequence('"ambientTracks"', 'id'), GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "ambientTracks"), 1), true);

COMMIT;
