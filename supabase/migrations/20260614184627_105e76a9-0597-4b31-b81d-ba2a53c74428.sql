
ALTER TABLE public.members
  ADD CONSTRAINT members_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.donations
  ADD CONSTRAINT donations_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.volunteer_applications
  ADD CONSTRAINT volunteer_applications_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
