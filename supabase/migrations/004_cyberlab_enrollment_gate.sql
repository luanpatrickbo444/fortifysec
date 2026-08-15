-- FortifySec V7.8 — CyberLab access gate
-- Apply after 002_labs_challenges_ctf.sql.
-- Students may read CyberLab catalog/session data only with an active enrollment.
-- Admins keep access for operation/testing.

drop policy if exists labs_read_catalog on public.labs;
create policy labs_read_catalog
on public.labs for select
to authenticated
using (
  public.current_user_active()
  and (
    public.is_admin()
    or (published = true and public.has_platform_access())
  )
);

drop policy if exists lab_sessions_read_own on public.lab_sessions;
create policy lab_sessions_read_own
on public.lab_sessions for select
to authenticated
using (
  public.current_user_active()
  and (
    public.is_admin()
    or (user_id = auth.uid() and public.has_platform_access())
  )
);

notify pgrst, 'reload schema';
