insert into public.categorias (nombre)
values
  ('Toallitas humedas'),
  ('Accesorios')
on conflict (nombre) do nothing;

insert into public.subcategorias (categoria_id, nombre)
select c.id, 'General'
from public.categorias c
where c.nombre in ('Toallitas humedas', 'Accesorios')
  and not exists (
    select 1
    from public.subcategorias sc
    where sc.categoria_id = c.id
      and lower(sc.nombre) = 'general'
  );

update public.subcategorias sc
set categoria_id = destino.id
from public.categorias origen
join public.categorias destino on destino.nombre = 'Toallitas humedas'
where origen.nombre in ('Toallitas', 'Toalitas')
  and sc.categoria_id = origen.id;

update public.productos p
set subcategoria_id = sc.id
from public.subcategorias sc
join public.categorias c on c.id = sc.categoria_id
where c.nombre = 'Accesorios'
  and sc.nombre = 'General'
  and p.subcategoria_id is null;

delete from public.categorias c
where c.nombre in ('Toallitas', 'Toalitas')
  and not exists (
    select 1
    from public.subcategorias sc
    where sc.categoria_id = c.id
  );
