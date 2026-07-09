insert into public.categorias (nombre)
values ('Cremas y pomadas')
on conflict (nombre) do nothing;

insert into public.subcategorias (categoria_id, nombre)
select c.id, 'General'
from public.categorias c
where c.nombre = 'Cremas y pomadas'
  and not exists (
    select 1
    from public.subcategorias sc
    where sc.categoria_id = c.id
      and lower(sc.nombre) = 'general'
  );

update public.subcategorias sc
set categoria_id = destino.id
from public.categorias origen
join public.categorias destino on destino.nombre = 'Cremas y pomadas'
where origen.nombre = 'Cremas'
  and sc.categoria_id = origen.id;

delete from public.categorias c
where c.nombre = 'Cremas'
  and not exists (
    select 1
    from public.subcategorias sc
    where sc.categoria_id = c.id
  );
