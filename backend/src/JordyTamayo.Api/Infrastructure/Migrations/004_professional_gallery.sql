UPDATE site_profile SET hero_image_url='/images/trayectoria/principal.webp', portrait_image_url='/images/trayectoria/despacho.webp', degree_image_url='/images/trayectoria/archivo-5504.webp' WHERE id=1;

INSERT INTO media_posts(id,platform,title,url,thumbnail_url,caption,category,display_order,active)
SELECT md5('professional-gallery-' || filename)::uuid, 'Fotografía', title,
 '/images/trayectoria/' || filename || '.webp', '/images/trayectoria/' || filename || '.webp', caption, category, sort_order, true
FROM (VALUES
 ('estudio','La estrategia empieza aquí','Preparación y estudio en el despacho.','Práctica profesional',1),
 ('despacho','Una atención cercana','Jordy Tamayo en su espacio de trabajo.','El despacho',2),
 ('ceremonia','Un paso más en la formación','Un momento de la ceremonia de graduación.','Formación académica',3),
 ('asamblea','Una mirada institucional','Jordy Tamayo en un espacio de la Asamblea Nacional.','Trayectoria',4),
 ('graduacion','Formación compartida','Recuerdos de la graduación junto a sus compañeros.','Formación académica',5),
 ('posgrado','El valor de seguir aprendiendo','Un recuerdo de la ceremonia de posgrado.','Formación académica',6),
 ('cercania','El lado humano del despacho','Una mirada cercana a la vida profesional.','El despacho',7),
 ('territorio','Presencia en territorio','Una fotografía de su recorrido profesional en Latacunga.','Práctica profesional',8),
 ('encuentro','Momentos de una trayectoria','Un recuerdo de su visita a la Asamblea Nacional.','Trayectoria',9),
 ('archivo-5504','Una meta cumplida','Retrato con su título de posgrado.','Formación académica',10),
 ('archivo-5428','Recuerdos de posgrado','Jordy Tamayo durante su graduación.','Formación académica',11),
 ('archivo-7422','Ejercicio profesional','Un momento de su actividad profesional.','Práctica profesional',12),
 ('archivo-6814','Desde el despacho','Un espacio para escuchar y preparar cada paso.','El despacho',13)
) AS photos(filename,title,caption,category,sort_order)
ON CONFLICT (url) DO NOTHING;
