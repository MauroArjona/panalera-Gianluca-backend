insert into public.categorias (nombre)
values
  ('Panales'),
  ('Higiene'),
  ('Accesorios'),
  ('Promociones')
on conflict (nombre) do nothing;

insert into public.subcategorias (categoria_id, nombre)
select c.id, s.nombre
from public.categorias c
join (
  values
    ('Panales', 'Huggies'),
    ('Panales', 'Pampers'),
    ('Panales', 'Babysec'),
    ('Panales', 'General'),
    ('Higiene', 'Toallitas humedas'),
    ('Higiene', 'Oleos y cremas'),
    ('Higiene', 'General'),
    ('Accesorios', 'Mamaderas'),
    ('Accesorios', 'Chupetes'),
    ('Accesorios', 'General'),
    ('Promociones', 'Combos'),
    ('Promociones', 'General')
) as s(categoria, nombre) on s.categoria = c.nombre
where not exists (
  select 1
  from public.subcategorias sc
  where sc.categoria_id = c.id
    and sc.nombre = s.nombre
);
