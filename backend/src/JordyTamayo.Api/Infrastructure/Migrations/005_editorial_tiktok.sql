-- Retire the previous social selection, preserving photographs and recoverable records.
UPDATE media_posts SET active = false WHERE platform <> 'Fotografía';
INSERT INTO media_posts(id, platform, title, url, thumbnail_url, caption, category, display_order, active)
VALUES
(md5('editorial-7673717461102906644')::uuid, 'TikTok', 'Defender derechos. Perseverar hasta el final.', 'https://www.tiktok.com/@jordytamayo/video/7673717461102906644', '', 'Jordy comparte su experiencia en una acción de protección: preparación, perseverancia y compromiso con los derechos de su clienta.', 'Defensa de derechos', 1, true),
(md5('editorial-7677776683931340052')::uuid, 'TikTok', 'La confianza también construye justicia.', 'https://www.tiktok.com/@jordytamayo/video/7677776683931340052', '', 'Un agradecimiento a quienes confían en el despacho y una invitación a conversar sobre sus inquietudes.', 'Comunidad', 2, true),
(md5('editorial-7688151810992852245')::uuid, 'TikTok', 'La vocación va más allá de un caso.', 'https://www.tiktok.com/@jordytamayo/video/7688151810992852245', '', 'Una mirada cercana a la vocación de servicio y al compromiso de acompañar a su gente.', 'Vocación', 3, true)
ON CONFLICT (url) DO UPDATE SET active = true;
