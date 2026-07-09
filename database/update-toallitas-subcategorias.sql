insert into public.categorias (nombre)
values ('Toallitas humedas')
on conflict (nombre) do nothing;

insert into public.subcategorias (categoria_id, nombre)
select c.id, s.nombre
from public.categorias c
join (
  values
    ('Kimbies'),
    ('Estrella'),
    ('Huggies'),
    ('Q Soft'),
    ('Toddler'),
    ('Pampers'),
    ('Adultos'),
    ('Mundial'),
    ('Babysec'),
    ('General')
) as s(nombre) on true
where c.nombre = 'Toallitas humedas'
  and not exists (
    select 1
    from public.subcategorias sc
    where sc.categoria_id = c.id
      and lower(sc.nombre) = lower(s.nombre)
  );

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Kimbies'
  and p.id in (83);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Estrella'
  and p.id in (84, 87, 115);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Huggies'
  and p.id in (85, 86, 88, 89, 90, 91, 93, 160, 221);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Q Soft'
  and p.id in (159, 161);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Toddler'
  and p.id in (162, 200);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Pampers'
  and p.id in (164);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Adultos'
  and p.id in (211, 212);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Mundial'
  and p.id in (213);

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Toallitas humedas'
  and sc.nombre = 'Babysec'
  and p.id in (237);
