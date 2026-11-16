UPDATE products SET image_url = CASE name
  WHEN 'Pão Francês' THEN 'https://images.unsplash.com/photo-1725297952102-ab28892a31ab?auto=format&fit=crop&w=500&q=80'
  WHEN 'Croissant Francês' THEN 'https://images.unsplash.com/photo-1763207291761-e27bb059d851?auto=format&fit=crop&w=500&q=80'
  WHEN 'Cookie Chocolate' THEN 'https://images.unsplash.com/photo-1594403758808-58d9e13cff40?auto=format&fit=crop&w=500&q=80'
  WHEN 'Croissant Amêndoas' THEN 'https://images.unsplash.com/photo-1787069943470-66fd161e100a?auto=format&fit=crop&w=500&q=80'
  WHEN 'Pão de Queijo' THEN 'https://images.unsplash.com/photo-1771757751633-4912e7282379?auto=format&fit=crop&w=500&q=80'
  WHEN 'Torta de Frutas' THEN 'https://images.unsplash.com/photo-1746959482020-e4f61eefba28?auto=format&fit=crop&w=500&q=80'
  WHEN 'Baguete Artesanal' THEN 'https://images.unsplash.com/photo-1725297952102-ab28892a31ab?auto=format&fit=crop&w=500&q=80'
  WHEN 'Cappuccino' THEN 'https://images.unsplash.com/photo-1787069943470-66fd161e100a?auto=format&fit=crop&w=500&q=80'
  ELSE image_url END
WHERE image_url IS NULL;
