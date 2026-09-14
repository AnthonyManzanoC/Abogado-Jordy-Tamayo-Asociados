-- Upgrade only the bundled illustrations; preserve every administrator upload.
UPDATE legal_services
SET gallery_image_urls = ARRAY(
  SELECT CASE
    WHEN image ~ '^/images/services/(penal|familia|civil|transito)-[1-4]\.svg$'
      THEN regexp_replace(image, '\.svg$', '.webp')
    ELSE image
  END
  FROM unnest(gallery_image_urls) WITH ORDINALITY AS gallery(image, position)
  ORDER BY position
)
WHERE EXISTS (
  SELECT 1 FROM unnest(gallery_image_urls) AS image
  WHERE image ~ '^/images/services/(penal|familia|civil|transito)-[1-4]\.svg$'
);
