alter table public.talles
  add column if not exists precio numeric,
  add column if not exists unidades text,
  add column if not exists imagen_url text;

update public.talles t
set precio = p.price
from public.productos p
where t.producto_id = p.id
  and t.precio is null;
