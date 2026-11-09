SET local check_function_bodies = off;

CREATE TABLE "public"."challenge_solves" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      uuid                     NOT NULL,
  "challenge_id" uuid                     NOT NULL,
  "solved_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "challenge_solves_pkey" PRIMARY KEY (id),
  CONSTRAINT "challenge_solves_user_id_challenge_id_key" UNIQUE (user_id, challenge_id)
);

ALTER TABLE "public"."challenge_solves"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."challenge_solves" FROM "anon";

CREATE TABLE "public"."challenges" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"       text                     NOT NULL,
  "slug"        text                     NOT NULL,
  "description" text                     NOT NULL DEFAULT ''::text,
  "briefing"    text,
  "category"    text                     NOT NULL DEFAULT 'Web'::text,
  "difficulty"  text                     NOT NULL DEFAULT 'Easy'::text,
  "xp_reward"   integer                  NOT NULL DEFAULT 50,
  "flag_hash"   bytea                    NOT NULL,
  "published"   boolean                  NOT NULL DEFAULT false,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "lab_id"      uuid,
  CONSTRAINT "challenges_difficulty_check" CHECK ((difficulty = ANY (ARRAY['Easy'::text, 'Medium'::text, 'Hard'::text, 'Insane'::text]))),
  CONSTRAINT "challenges_pkey" PRIMARY KEY (id),
  CONSTRAINT "challenges_slug_key" UNIQUE (slug),
  CONSTRAINT "challenges_xp_reward_check" CHECK (((xp_reward >= 0) AND (xp_reward <= 10000)))
);

ALTER TABLE "public"."challenges"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."challenges" FROM "anon";

CREATE TABLE "public"."cloud_backup_jobs" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid                     NOT NULL,
  "asset_id"        uuid,
  "provider"        text,
  "external_job_id" text,
  "status"          text                     NOT NULL,
  "started_at"      timestamp with time zone,
  "finished_at"     timestamp with time zone,
  "bytes_processed" bigint,
  "retention_label" text,
  "details"         jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_backup_jobs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_backup_jobs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_incidents" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id"   uuid                     NOT NULL,
  "title"             text                     NOT NULL,
  "severity"          text                     NOT NULL DEFAULT 'medium'::text,
  "status"            text                     NOT NULL DEFAULT 'open'::text,
  "opened_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "resolved_at"       timestamp with time zone,
  "summary"           text,
  "asset_id"          uuid,
  "provider"          text,
  "external_alert_id" text,
  "details"           jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "last_seen_at"      timestamp with time zone,
  CONSTRAINT "cloud_incidents_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_incidents"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_integration_events" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid,
  "provider"        text                     NOT NULL,
  "event_type"      text                     NOT NULL,
  "external_id"     text,
  "payload"         jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "received_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_integration_events_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_integration_events"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_leads" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "company"     text                     NOT NULL,
  "email"       text                     NOT NULL,
  "phone"       text,
  "employees"   text,
  "data_volume" text,
  "message"     text,
  "status"      text                     NOT NULL DEFAULT 'new'::text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_leads_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_leads"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_monthly_reports" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id"       uuid                     NOT NULL,
  "reference_month"       date                     NOT NULL,
  "health_score"          numeric(5,2),
  "backup_success_rate"   numeric(5,2),
  "recovery_tests_passed" integer                  DEFAULT 0,
  "incidents_count"       integer                  DEFAULT 0,
  "report_url"            text,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "generation_status"     text                     NOT NULL DEFAULT 'ready'::text,
  "source"                text                     NOT NULL DEFAULT 'admin'::text,
  "generated_by"          uuid,
  "generated_at"          timestamp with time zone,
  "summary"               jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT "cloud_monthly_reports_organization_id_reference_month_key" UNIQUE (organization_id, reference_month),
  CONSTRAINT "cloud_monthly_reports_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_monthly_reports"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_onboarding_requests" (
  "id"                          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                     uuid                     NOT NULL,
  "organization_name"           text                     NOT NULL,
  "legal_name"                  text,
  "cnpj"                        text,
  "contact_name"                text                     NOT NULL,
  "contact_phone"               text,
  "plan"                        text                     NOT NULL DEFAULT 'Business'::text,
  "employees"                   text,
  "data_volume"                 text,
  "infrastructure"              text,
  "current_backup"              text,
  "critical_systems"            text,
  "rpo_target"                  text,
  "rto_target"                  text,
  "notes"                       text,
  "status"                      text                     NOT NULL DEFAULT 'submitted'::text,
  "admin_notes"                 text,
  "provisioned_organization_id" uuid,
  "created_at"                  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_onboarding_requests_pkey" PRIMARY KEY (id),
  CONSTRAINT "cloud_onboarding_requests_plan_check" CHECK ((plan = ANY (ARRAY['Essencial'::text, 'Business'::text, 'Enterprise'::text]))),
  CONSTRAINT "cloud_onboarding_requests_status_check"
    CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'reviewing'::text, 'needs_info'::text, 'approved'::text, 'rejected'::text, 'provisioned'::text]))),
  CONSTRAINT "cloud_onboarding_requests_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."cloud_onboarding_requests"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_organization_members" (
  "organization_id" uuid                     NOT NULL,
  "user_id"         uuid                     NOT NULL,
  "member_role"     text                     NOT NULL DEFAULT 'viewer'::text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_organization_members_member_role_check" CHECK ((member_role = ANY (ARRAY['admin'::text, 'operator'::text, 'viewer'::text]))),
  CONSTRAINT "cloud_organization_members_pkey" PRIMARY KEY (organization_id, user_id)
);

ALTER TABLE "public"."cloud_organization_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_organizations" (
  "id"                               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"                             text                     NOT NULL,
  "plan"                             text                     NOT NULL DEFAULT 'Essencial'::text,
  "status"                           text                     NOT NULL DEFAULT 'onboarding'::text,
  "created_at"                       timestamp with time zone NOT NULL DEFAULT now(),
  "legal_name"                       text,
  "cnpj"                             text,
  "contact_email"                    text,
  "contact_phone"                    text,
  "employees"                        text,
  "data_volume"                      text,
  "rpo_target"                       text,
  "rto_target"                       text,
  "admin_notes"                      text,
  "updated_at"                       timestamp with time zone NOT NULL DEFAULT now(),
  "provider"                         text,
  "provider_tenant_id"               text,
  "provider_metadata"                jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "last_provider_sync_at"            timestamp with time zone,
  "provider_storage_bytes"           bigint,
  "provider_immutable_storage_bytes" bigint,
  "provider_usage_synced_at"         timestamp with time zone,
  CONSTRAINT "cloud_organizations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_organizations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_profiles" (
  "id"         uuid                     NOT NULL,
  "full_name"  text,
  "role"       text                     NOT NULL DEFAULT 'client'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "cloud_profiles_role_check" CHECK ((role = ANY (ARRAY['client'::text, 'admin'::text])))
);

ALTER TABLE "public"."cloud_profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_protected_assets" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id"   uuid                     NOT NULL,
  "name"              text                     NOT NULL,
  "asset_type"        text                     NOT NULL,
  "owner_area"        text,
  "policy_name"       text,
  "status"            text                     NOT NULL DEFAULT 'pending'::text,
  "provider_ref"      text,
  "protected_bytes"   bigint                   NOT NULL DEFAULT 0,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "provider"          text,
  "operating_system"  text,
  "cyberfit_score"    integer,
  "last_backup_at"    timestamp with time zone,
  "next_backup_at"    timestamp with time zone,
  "last_sync_at"      timestamp with time zone,
  "provider_metadata" jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT "cloud_protected_assets_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_protected_assets"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_provider_sync_runs" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "provider"           text                     NOT NULL,
  "organization_id"    uuid,
  "provider_tenant_id" text,
  "status"             text                     NOT NULL DEFAULT 'running'::text,
  "summary"            jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "error_message"      text,
  "started_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "finished_at"        timestamp with time zone,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_provider_sync_runs_pkey" PRIMARY KEY (id),
  CONSTRAINT "cloud_provider_sync_runs_status_check" CHECK ((status = ANY (ARRAY['running'::text, 'success'::text, 'warning'::text, 'failed'::text])))
);

ALTER TABLE "public"."cloud_provider_sync_runs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_recovery_tests" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid                     NOT NULL,
  "asset_id"        uuid,
  "test_type"       text                     NOT NULL,
  "status"          text                     NOT NULL DEFAULT 'planned'::text,
  "scheduled_at"    timestamp with time zone,
  "completed_at"    timestamp with time zone,
  "rto_seconds"     integer,
  "evidence_url"    text,
  "notes"           text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_recovery_tests_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_recovery_tests"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_support_ticket_messages" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "ticket_id"       uuid                     NOT NULL,
  "organization_id" uuid                     NOT NULL,
  "author_id"       uuid,
  "author_role"     text                     NOT NULL DEFAULT 'customer'::text,
  "body"            text                     NOT NULL,
  "is_internal"     boolean                  NOT NULL DEFAULT false,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cloud_support_ticket_messages_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_support_ticket_messages"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cloud_support_tickets" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid                     NOT NULL,
  "opened_by"       uuid,
  "subject"         text                     NOT NULL,
  "priority"        text                     NOT NULL DEFAULT 'normal'::text,
  "description"     text                     NOT NULL,
  "status"          text                     NOT NULL DEFAULT 'open'::text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "category"        text                     NOT NULL DEFAULT 'support'::text,
  "assigned_to"     uuid,
  "resolution_note" text,
  "resolved_at"     timestamp with time zone,
  "closed_at"       timestamp with time zone,
  "last_reply_at"   timestamp with time zone,
  CONSTRAINT "cloud_support_tickets_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cloud_support_tickets"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."companies" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "slug"        text                     NOT NULL,
  "description" text                     NOT NULL DEFAULT ''::text,
  "website"     text,
  "location"    text,
  "verified"    boolean                  NOT NULL DEFAULT false,
  "active"      boolean                  NOT NULL DEFAULT true,
  "created_by"  uuid                     NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "companies_pkey" PRIMARY KEY (id),
  CONSTRAINT "companies_slug_key" UNIQUE (slug)
);

ALTER TABLE "public"."companies"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."company_members" (
  "company_id"  uuid                     NOT NULL,
  "user_id"     uuid                     NOT NULL,
  "member_role" text                     NOT NULL DEFAULT 'recruiter'::text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "company_members_member_role_check" CHECK ((member_role = ANY (ARRAY['owner'::text, 'recruiter'::text]))),
  CONSTRAINT "company_members_pkey" PRIMARY KEY (company_id, user_id)
);

ALTER TABLE "public"."company_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."company_talent_shortlist" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "company_id"     uuid                     NOT NULL,
  "talent_user_id" uuid                     NOT NULL,
  "added_by"       uuid                     NOT NULL,
  "status"         text                     NOT NULL DEFAULT 'saved'::text,
  "notes"          text                     NOT NULL DEFAULT ''::text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "company_talent_shortlist_company_id_talent_user_id_key" UNIQUE (company_id, talent_user_id),
  CONSTRAINT "company_talent_shortlist_pkey" PRIMARY KEY (id),
  CONSTRAINT "company_talent_shortlist_status_check" CHECK ((status = ANY (ARRAY['saved'::text, 'contacted'::text, 'interview'::text, 'archived'::text])))
);

ALTER TABLE "public"."company_talent_shortlist"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."company_talent_shortlist" FROM "anon";

CREATE TABLE "public"."course_modules" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "course_id"   uuid                     NOT NULL,
  "title"       text                     NOT NULL,
  "description" text                     NOT NULL DEFAULT ''::text,
  "position"    integer                  NOT NULL,
  "published"   boolean                  NOT NULL DEFAULT true,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "course_modules_course_id_position_key" UNIQUE (course_id, "position"),
  CONSTRAINT "course_modules_pkey" PRIMARY KEY (id),
  CONSTRAINT "course_modules_position_check" CHECK (("position" > 0))
);

ALTER TABLE "public"."course_modules"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."course_modules" FROM "anon";

CREATE TABLE "public"."courses" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"          text                     NOT NULL DEFAULT 'Curso'::text,
  "slug"           text                     NOT NULL,
  "description"    text                     NOT NULL DEFAULT ''::text,
  "thumbnail_url"  text                     DEFAULT ''::text,
  "workload_hours" integer                  NOT NULL DEFAULT 0,
  "published"      boolean                  NOT NULL DEFAULT false,
  "position"       integer                  NOT NULL DEFAULT 0,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "price_cents"    integer                  NOT NULL DEFAULT 0,
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "billing_type"   text                     NOT NULL DEFAULT 'one_time'::text,
  CONSTRAINT "courses_billing_type_check" CHECK ((billing_type = ANY (ARRAY['one_time'::text, 'subscription'::text]))),
  CONSTRAINT "courses_pkey" PRIMARY KEY (id),
  CONSTRAINT "courses_slug_key" UNIQUE (slug)
);

ALTER TABLE "public"."courses"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."courses" FROM "anon";

CREATE TABLE "public"."ctf_event_challenges" (
  "event_id"        uuid    NOT NULL,
  "challenge_id"    uuid    NOT NULL,
  "position"        integer NOT NULL DEFAULT 1,
  "points_override" integer,
  CONSTRAINT "ctf_event_challenges_pkey" PRIMARY KEY (event_id, challenge_id)
);

ALTER TABLE "public"."ctf_event_challenges"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."ctf_event_challenges" FROM "anon";

CREATE TABLE "public"."ctf_events" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"       text                     NOT NULL,
  "description" text                     NOT NULL DEFAULT ''::text,
  "starts_at"   timestamp with time zone NOT NULL,
  "ends_at"     timestamp with time zone NOT NULL,
  "prize_text"  text,
  "status"      text                     NOT NULL DEFAULT 'scheduled'::text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ctf_events_check" CHECK ((ends_at > starts_at)),
  CONSTRAINT "ctf_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "ctf_events_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'live'::text, 'finished'::text])))
);

ALTER TABLE "public"."ctf_events"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."ctf_events" FROM "anon";

CREATE TABLE "public"."ctf_participants" (
  "event_id"  uuid                     NOT NULL,
  "user_id"   uuid                     NOT NULL,
  "joined_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ctf_participants_pkey" PRIMARY KEY (event_id, user_id)
);

ALTER TABLE "public"."ctf_participants"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."ctf_participants" FROM "anon";

CREATE TABLE "public"."ctf_solves" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "event_id"     uuid                     NOT NULL,
  "challenge_id" uuid                     NOT NULL,
  "user_id"      uuid                     NOT NULL,
  "points"       integer                  NOT NULL DEFAULT 0,
  "solved_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ctf_solves_event_id_challenge_id_user_id_key" UNIQUE (event_id, challenge_id, user_id),
  CONSTRAINT "ctf_solves_pkey" PRIMARY KEY (id),
  CONSTRAINT "ctf_solves_points_check" CHECK ((points >= 0))
);

ALTER TABLE "public"."ctf_solves"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."ctf_solves" FROM "anon";

CREATE TABLE "public"."enrollments" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      uuid                     NOT NULL,
  "course_id"    uuid                     NOT NULL,
  "status"       text                     NOT NULL DEFAULT 'pending'::text,
  "source"       text                     NOT NULL DEFAULT 'admin'::text,
  "payment_id"   text,
  "enrolled_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "activated_at" timestamp with time zone,
  "created_at"   timestamp with time zone DEFAULT now(),
  "updated_at"   timestamp with time zone DEFAULT now(),
  CONSTRAINT "enrollments_pkey" PRIMARY KEY (id),
  CONSTRAINT "enrollments_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'blocked'::text, 'refunded'::text]))),
  CONSTRAINT "enrollments_user_course_unique" UNIQUE (user_id, course_id)
);

ALTER TABLE "public"."enrollments"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."enrollments" FROM "anon";

CREATE TABLE "public"."job_applications" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "job_id"     uuid                     NOT NULL,
  "user_id"    uuid                     NOT NULL,
  "cover_note" text                     NOT NULL DEFAULT ''::text,
  "status"     text                     NOT NULL DEFAULT 'submitted'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "job_applications_job_id_user_id_key" UNIQUE (job_id, user_id),
  CONSTRAINT "job_applications_pkey" PRIMARY KEY (id),
  CONSTRAINT "job_applications_status_check" CHECK ((status = ANY (ARRAY['submitted'::text, 'viewed'::text, 'interview'::text, 'rejected'::text, 'hired'::text])))
);

ALTER TABLE "public"."job_applications"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."jobs" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "company_id"      uuid                     NOT NULL,
  "created_by"      uuid                     NOT NULL,
  "title"           text                     NOT NULL,
  "slug"            text                     NOT NULL,
  "description"     text                     NOT NULL DEFAULT ''::text,
  "requirements"    text                     NOT NULL DEFAULT ''::text,
  "location"        text,
  "work_mode"       text                     NOT NULL DEFAULT 'remote'::text,
  "employment_type" text                     NOT NULL DEFAULT 'full_time'::text,
  "seniority"       text,
  "salary_min"      integer,
  "salary_max"      integer,
  "status"          text                     NOT NULL DEFAULT 'draft'::text,
  "published_at"    timestamp with time zone,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "jobs_check" CHECK (((salary_min IS NULL) OR (salary_max IS NULL) OR (salary_max >= salary_min))),
  CONSTRAINT "jobs_employment_type_check" CHECK ((employment_type = ANY (ARRAY['full_time'::text, 'part_time'::text, 'contract'::text, 'internship'::text]))),
  CONSTRAINT "jobs_pkey" PRIMARY KEY (id),
  CONSTRAINT "jobs_salary_max_check" CHECK (((salary_max IS NULL) OR (salary_max >= 0))),
  CONSTRAINT "jobs_salary_min_check" CHECK (((salary_min IS NULL) OR (salary_min >= 0))),
  CONSTRAINT "jobs_slug_key" UNIQUE (slug),
  CONSTRAINT "jobs_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text]))),
  CONSTRAINT "jobs_work_mode_check" CHECK ((work_mode = ANY (ARRAY['remote'::text, 'hybrid'::text, 'onsite'::text])))
);

ALTER TABLE "public"."jobs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."lab_sessions" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"             uuid                     NOT NULL,
  "lab_id"              uuid                     NOT NULL,
  "status"              text                     NOT NULL DEFAULT 'running'::text,
  "connection_url"      text,
  "provider_session_id" text,
  "started_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "stopped_at"          timestamp with time zone,
  "expires_at"          timestamp with time zone,
  "target_address"      text,
  "vpn_download_url"    text,
  CONSTRAINT "lab_sessions_pkey" PRIMARY KEY (id),
  CONSTRAINT "lab_sessions_status_check" CHECK ((status = ANY (ARRAY['running'::text, 'stopped'::text, 'expired'::text, 'revoked'::text])))
);

ALTER TABLE "public"."lab_sessions"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."lab_sessions" FROM "anon";

CREATE TABLE "public"."labs" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"             text                     NOT NULL,
  "slug"              text                     NOT NULL,
  "description"       text                     NOT NULL DEFAULT ''::text,
  "instructions"      text,
  "difficulty"        text                     NOT NULL DEFAULT 'Easy'::text,
  "estimated_minutes" integer                  NOT NULL DEFAULT 60,
  "tags"              text[]                   NOT NULL DEFAULT '{}'::text[],
  "connection_url"    text,
  "provider_lab_id"   text,
  "published"         boolean                  NOT NULL DEFAULT false,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "labs_difficulty_check" CHECK ((difficulty = ANY (ARRAY['Easy'::text, 'Medium'::text, 'Hard'::text, 'Insane'::text]))),
  CONSTRAINT "labs_estimated_minutes_check" CHECK (((estimated_minutes >= 15) AND (estimated_minutes <= 720))),
  CONSTRAINT "labs_pkey" PRIMARY KEY (id),
  CONSTRAINT "labs_slug_key" UNIQUE (slug)
);

ALTER TABLE "public"."labs"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."labs" FROM "anon";

CREATE TABLE "public"."lesson_progress" (
  "user_id"         uuid                     NOT NULL,
  "lesson_id"       uuid                     NOT NULL,
  "completed"       boolean                  NOT NULL DEFAULT false,
  "watched_seconds" integer                  NOT NULL DEFAULT 0,
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "completed_at"    timestamp with time zone,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "lesson_progress_pkey" PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE "public"."lesson_progress"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."lesson_progress" FROM "anon";

CREATE TABLE "public"."lessons" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "module_id"        uuid                     NOT NULL,
  "title"            text                     NOT NULL DEFAULT 'Aula'::text,
  "description"      text                     DEFAULT ''::text,
  "youtube_url"      text                     DEFAULT ''::text,
  "duration_minutes" integer                  NOT NULL DEFAULT 0,
  "position"         integer                  NOT NULL DEFAULT 1,
  "published"        boolean                  NOT NULL DEFAULT true,
  "course_id"        uuid,
  "content"          text,
  "video_url"        text,
  "xp_reward"        integer                  NOT NULL DEFAULT 10,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "summary"          text                     NOT NULL DEFAULT ''::text,
  CONSTRAINT "lessons_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."lessons"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."lessons" FROM "anon";

CREATE TABLE "public"."modules" (
  "id"        uuid    NOT NULL DEFAULT gen_random_uuid(),
  "course_id" uuid    NOT NULL,
  "title"     text    NOT NULL,
  "position"  integer NOT NULL DEFAULT 0,
  CONSTRAINT "modules_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."modules"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."payment_events" (
  "payment_id" text                     NOT NULL,
  "user_id"    uuid,
  "status"     text                     NOT NULL,
  "amount"     numeric(10,2),
  "raw"        jsonb                    NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "payment_events_pkey" PRIMARY KEY (payment_id)
);

ALTER TABLE "public"."payment_events"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."payments" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"            uuid                     NOT NULL,
  "course_id"          uuid                     NOT NULL,
  "provider"           text                     NOT NULL DEFAULT 'mercadopago'::text,
  "preference_id"      text,
  "payment_id"         text,
  "external_reference" text,
  "status"             text                     NOT NULL DEFAULT 'pending'::text,
  "amount_cents"       integer                  NOT NULL DEFAULT 0,
  "raw"                jsonb,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "payments_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."payments"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."payments" FROM "anon";

CREATE TABLE "public"."profiles" (
  "id"             uuid                     NOT NULL,
  "email"          text                     NOT NULL DEFAULT ''::text,
  "full_name"      text                     DEFAULT ''::text,
  "role"           text                     NOT NULL DEFAULT 'student'::text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "name"           text                     NOT NULL DEFAULT 'Aluno'::text,
  "headline"       text,
  "blocked"        boolean                  NOT NULL DEFAULT false,
  "xp"             integer                  NOT NULL DEFAULT 0,
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "github_url"     text,
  "linkedin_url"   text,
  "profile_public" boolean                  NOT NULL DEFAULT false,
  "open_to_work"   boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_role_check" CHECK ((role = ANY (ARRAY['student'::text, 'admin'::text])))
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."site_settings" (
  "key"        text                     NOT NULL,
  "value"      jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "site_settings_pkey" PRIMARY KEY (key)
);

ALTER TABLE "public"."site_settings"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."subscriptions" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"             uuid                     NOT NULL,
  "course_id"           uuid                     NOT NULL,
  "provider"            text                     NOT NULL DEFAULT 'mercadopago'::text,
  "preapproval_id"      text,
  "external_reference"  text                     NOT NULL,
  "status"              text                     NOT NULL DEFAULT 'pending'::text,
  "amount_cents"        integer                  NOT NULL,
  "next_payment_date"   timestamp with time zone,
  "last_payment_status" text,
  "raw"                 jsonb,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "subscriptions_amount_cents_check" CHECK ((amount_cents >= 0)),
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "subscriptions_preapproval_id_key" UNIQUE (preapproval_id),
  CONSTRAINT "subscriptions_user_id_course_id_key" UNIQUE (user_id, course_id)
);

ALTER TABLE "public"."subscriptions"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_create_challenge (
  p_title       text,
  p_slug        text,
  p_description text,
  p_category    text,
  p_difficulty  text,
  p_xp_reward   integer,
  p_briefing    text,
  p_flag        text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare new_id uuid;
begin
 insert into public.challenges(title,slug,description,category,difficulty,xp_reward,briefing,flag_hash,published)
 values(p_title,p_slug,p_description,p_category,p_difficulty,p_xp_reward,p_briefing,digest(p_flag,'sha256'),true)
 returning id into new_id;
 return new_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.award_lesson_xp()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare reward integer;
begin
  if new.completed=true and (tg_op='INSERT' or old.completed=false) then
    select xp_reward into reward from public.lessons where id=new.lesson_id;
    update public.profiles set xp=xp+coalesce(reward,0) where id=new.user_id;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.cloud_can_view_profile (
  target uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select public.cloud_is_admin()
  or target = auth.uid()
  or exists(
    select 1
    from public.cloud_organization_members mine
    join public.cloud_organization_members theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid()
      and theirs.user_id = target
  );
$function$;

CREATE OR REPLACE FUNCTION public.cloud_is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists(
    select 1
    from public.cloud_profiles
    where id = auth.uid() and role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.cloud_is_org_member (
  org uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select public.cloud_is_admin()
  or exists(
    select 1
    from public.cloud_organization_members
    where organization_id = org and user_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.cloud_touch_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.current_user_active()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.blocked=false); $function$;

CREATE OR REPLACE FUNCTION public.fortify_cloud_handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.cloud_profiles(id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1))
  )
  on conflict(id) do update
    set full_name = coalesce(public.cloud_profiles.full_name, excluded.full_name);
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_ctf_leaderboard (
  event_uuid  uuid,
  limit_count integer DEFAULT 100
)
  RETURNS TABLE (
    user_id    uuid,
    name       text,
    headline   text,
    points     bigint,
    solves     bigint,
    last_solve timestamp with time zone
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select p.id,p.name,p.headline,
         coalesce(sum(s.points),0)::bigint as points,
         count(s.id)::bigint as solves,
         max(s.solved_at) as last_solve
  from public.ctf_participants cp
  join public.profiles p on p.id=cp.user_id and not p.blocked
  left join public.ctf_solves s on s.event_id=cp.event_id and s.user_id=cp.user_id
  where cp.event_id=event_uuid
  group by p.id,p.name,p.headline,cp.joined_at
  order by points desc, solves desc, last_solve asc nulls last, cp.joined_at asc
  limit least(greatest(limit_count,1),200);
$function$;

CREATE OR REPLACE FUNCTION public.get_leaderboard (
  limit_count integer DEFAULT 100
)
  RETURNS TABLE (
    id       uuid,
    name     text,
    headline text,
    xp       integer
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select p.id,
         coalesce(p.name,'Aluno')::text,
         p.headline::text,
         coalesce(p.xp,0)::integer
  from public.profiles p
  where coalesce(p.blocked,false)=false
  order by coalesce(p.xp,0) desc, p.created_at asc
  limit least(greatest(limit_count,1),100);
$function$;

CREATE OR REPLACE FUNCTION public.get_public_talent_board (
  limit_count integer DEFAULT 60
)
  RETURNS TABLE (
    id           uuid,
    name         text,
    headline     text,
    xp           integer,
    open_to_work boolean,
    github_url   text,
    linkedin_url text
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
 select p.id,p.name,p.headline,p.xp,p.open_to_work,p.github_url,p.linkedin_url
 from public.profiles p where p.profile_public=true and p.blocked=false
 order by p.xp desc,p.created_at asc limit least(greatest(limit_count,1),100);
$function$;

CREATE OR REPLACE FUNCTION public.guard_lesson_progress()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  if tg_op='UPDATE' and old.completed=true and new.completed=false then
    raise exception 'completed lesson cannot be reverted';
  end if;
  if new.completed=true and new.completed_at is null then new.completed_at=now(); end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.profiles(
    id, name, email, role, blocked, xp,
    created_at, updated_at, profile_public, open_to_work
  )
  values(
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name',''),
      nullif(new.raw_user_meta_data->>'full_name',''),
      nullif(split_part(coalesce(new.email,''),'@',1),''),
      'Aluno'
    ),
    coalesce(new.email,''),
    'student',
    false,
    0,
    now(),
    now(),
    false,
    false
  )
  on conflict (id) do update
  set
    email = case when coalesce(public.profiles.email,'')='' then excluded.email else public.profiles.email end,
    name = case when coalesce(public.profiles.name,'')='' then excluded.name else public.profiles.name end,
    updated_at = now();
 
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.has_platform_access()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists(
    select 1 from public.enrollments e
    join public.profiles p on p.id=e.user_id
    where e.user_id=auth.uid() and e.status='active' and not p.blocked
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists(
    select 1 from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.role::text,'student')='admin'
      and coalesce(p.blocked,false)=false
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_company_member (
  company_uuid uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists(
    select 1
    from public.company_members m

    join public.companies c
      on c.id = m.company_id

    where m.company_id = company_uuid
      and m.user_id = auth.uid()
      and c.active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.submit_challenge_flag (
  challenge_uuid uuid,
  candidate_flag text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare expected bytea; reward integer; inserted_count integer;
begin
  if auth.uid() is null or not public.has_platform_access() then return false; end if;
  select flag_hash,xp_reward into expected,reward from public.challenges where id=challenge_uuid and published=true;
  if expected is null or digest(candidate_flag,'sha256') <> expected then return false; end if;
  insert into public.challenge_solves(user_id,challenge_id) values(auth.uid(),challenge_uuid)
    on conflict(user_id,challenge_id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count=1 then update public.profiles set xp=xp+coalesce(reward,0) where id=auth.uid(); end if;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.submit_ctf_flag (
  event_uuid     uuid,
  challenge_uuid uuid,
  candidate_flag text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  expected bytea;
  reward integer;
  event_points integer;
  inserted_event integer;
  inserted_global integer;
begin
  if auth.uid() is null or not public.has_platform_access() then return false; end if;
 
  if not exists(
    select 1 from public.ctf_events e
    where e.id=event_uuid
      and e.status='live'
      and now() between e.starts_at and e.ends_at
  ) then return false; end if;
 
  if not exists(
    select 1 from public.ctf_participants p
    where p.event_id=event_uuid and p.user_id=auth.uid()
  ) then return false; end if;
 
  select c.flag_hash,c.xp_reward,coalesce(ec.points_override,c.xp_reward)
    into expected,reward,event_points
  from public.ctf_event_challenges ec
  join public.challenges c on c.id=ec.challenge_id
  where ec.event_id=event_uuid
    and ec.challenge_id=challenge_uuid
    and c.published=true;
 
  if expected is null or digest(candidate_flag,'sha256') <> expected then return false; end if;
 
  insert into public.ctf_solves(event_id,challenge_id,user_id,points)
  values(event_uuid,challenge_uuid,auth.uid(),coalesce(event_points,0))
  on conflict(event_id,challenge_id,user_id) do nothing;
  get diagnostics inserted_event = row_count;
 
  if inserted_event=1 then
    insert into public.challenge_solves(user_id,challenge_id)
    values(auth.uid(),challenge_uuid)
    on conflict(user_id,challenge_id) do nothing;
    get diagnostics inserted_global = row_count;
    if inserted_global=1 then
      update public.profiles set xp=xp+coalesce(reward,0) where id=auth.uid();
    end if;
  end if;
 
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

ALTER TABLE "public"."challenge_solves"
  ADD CONSTRAINT "challenge_solves_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_monthly_reports"
  ADD CONSTRAINT "cloud_monthly_reports_generated_by_fkey" FOREIGN KEY (generated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_onboarding_requests"
  ADD CONSTRAINT "cloud_onboarding_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_organization_members"
  ADD CONSTRAINT "cloud_organization_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_backup_jobs"
  ADD CONSTRAINT "cloud_backup_jobs_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_incidents"
  ADD CONSTRAINT "cloud_incidents_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_integration_events"
  ADD CONSTRAINT "cloud_integration_events_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_monthly_reports"
  ADD CONSTRAINT "cloud_monthly_reports_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_onboarding_requests"
  ADD CONSTRAINT "cloud_onboarding_requests_provisioned_organization_id_fkey" FOREIGN KEY (provisioned_organization_id) REFERENCES public.cloud_organizations(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_organization_members"
  ADD CONSTRAINT "cloud_organization_members_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_profiles"
  ADD CONSTRAINT "cloud_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_protected_assets"
  ADD CONSTRAINT "cloud_protected_assets_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_backup_jobs"
  ADD CONSTRAINT "cloud_backup_jobs_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.cloud_protected_assets(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_incidents"
  ADD CONSTRAINT "cloud_incidents_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.cloud_protected_assets(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_provider_sync_runs"
  ADD CONSTRAINT "cloud_provider_sync_runs_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_recovery_tests"
  ADD CONSTRAINT "cloud_recovery_tests_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.cloud_protected_assets(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_recovery_tests"
  ADD CONSTRAINT "cloud_recovery_tests_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_support_ticket_messages"
  ADD CONSTRAINT "cloud_support_ticket_messages_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_support_ticket_messages"
  ADD CONSTRAINT "cloud_support_ticket_messages_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_support_tickets"
  ADD CONSTRAINT "cloud_support_tickets_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_support_tickets"
  ADD CONSTRAINT "cloud_support_tickets_opened_by_fkey" FOREIGN KEY (opened_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."cloud_support_tickets"
  ADD CONSTRAINT "cloud_support_tickets_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.cloud_organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."cloud_support_ticket_messages"
  ADD CONSTRAINT "cloud_support_ticket_messages_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES public.cloud_support_tickets(id) ON DELETE CASCADE;

ALTER TABLE "public"."company_members"
  ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE "public"."company_talent_shortlist"
  ADD CONSTRAINT "company_talent_shortlist_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE "public"."course_modules"
  ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE "public"."ctf_event_challenges"
  ADD CONSTRAINT "ctf_event_challenges_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;

ALTER TABLE "public"."ctf_event_challenges"
  ADD CONSTRAINT "ctf_event_challenges_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.ctf_events(id) ON DELETE CASCADE;

ALTER TABLE "public"."ctf_participants"
  ADD CONSTRAINT "ctf_participants_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.ctf_events(id) ON DELETE CASCADE;

ALTER TABLE "public"."ctf_solves"
  ADD CONSTRAINT "ctf_solves_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;

ALTER TABLE "public"."ctf_solves"
  ADD CONSTRAINT "ctf_solves_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.ctf_events(id) ON DELETE CASCADE;

ALTER TABLE "public"."enrollments"
  ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE "public"."enrollments"
  ADD CONSTRAINT "enrollments_user_id_course_id_key" UNIQUE (user_id, course_id);

ALTER TABLE "public"."enrollments"
  ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."jobs"
  ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE "public"."job_applications"
  ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE "public"."challenges"
  ADD CONSTRAINT "challenges_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE SET NULL;

ALTER TABLE "public"."lab_sessions"
  ADD CONSTRAINT "lab_sessions_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE;

ALTER TABLE "public"."lesson_progress"
  ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."lessons"
  ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."lesson_progress"
  ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;

ALTER TABLE "public"."modules"
  ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE "public"."lessons"
  ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;

ALTER TABLE "public"."payment_events"
  ADD CONSTRAINT "payment_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."payments"
  ADD CONSTRAINT "payments_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."challenge_solves"
  ADD CONSTRAINT "challenge_solves_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."companies"
  ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."company_members"
  ADD CONSTRAINT "company_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."company_talent_shortlist"
  ADD CONSTRAINT "company_talent_shortlist_added_by_fkey" FOREIGN KEY (added_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."company_talent_shortlist"
  ADD CONSTRAINT "company_talent_shortlist_talent_user_id_fkey" FOREIGN KEY (talent_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."ctf_participants"
  ADD CONSTRAINT "ctf_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."ctf_solves"
  ADD CONSTRAINT "ctf_solves_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."job_applications"
  ADD CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."jobs"
  ADD CONSTRAINT "jobs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."lab_sessions"
  ADD CONSTRAINT "lab_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."payments"
  ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."subscriptions"
  ADD CONSTRAINT "subscriptions_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE "public"."subscriptions"
  ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX challenge_solves_user_idx ON public.challenge_solves USING btree (user_id, solved_at DESC);

CREATE INDEX challenges_lab_idx ON public.challenges USING btree (lab_id);

CREATE INDEX cloud_assets_org_provider_idx ON public.cloud_protected_assets USING btree (organization_id, PROVIDER, last_sync_at DESC);

CREATE INDEX cloud_backup_jobs_org_finished_idx ON public.cloud_backup_jobs USING btree (organization_id, finished_at DESC);

CREATE UNIQUE INDEX cloud_backup_jobs_provider_external_uidx ON public.cloud_backup_jobs USING btree (organization_id, PROVIDER, external_job_id);

CREATE INDEX cloud_incidents_org_provider_idx ON public.cloud_incidents USING btree (organization_id, PROVIDER, opened_at DESC);

CREATE INDEX cloud_incidents_org_status_idx ON public.cloud_incidents USING btree (organization_id, status, opened_at DESC);

CREATE UNIQUE INDEX cloud_incidents_provider_external_uidx ON public.cloud_incidents USING btree (organization_id, PROVIDER, external_alert_id);

CREATE INDEX cloud_integration_events_org_received_idx ON public.cloud_integration_events USING btree (organization_id, received_at DESC);

CREATE INDEX cloud_leads_status_created_idx ON public.cloud_leads USING btree (status, created_at DESC);

CREATE INDEX cloud_monthly_reports_org_month_idx ON public.cloud_monthly_reports USING btree (organization_id, reference_month DESC);

CREATE INDEX cloud_onboarding_status_idx ON public.cloud_onboarding_requests USING btree (status, updated_at DESC);

CREATE UNIQUE INDEX cloud_onboarding_user_uidx ON public.cloud_onboarding_requests USING btree (user_id);

CREATE INDEX cloud_org_members_user_idx ON public.cloud_organization_members USING btree (user_id, organization_id);

CREATE INDEX cloud_org_provider_usage_sync_idx ON public.cloud_organizations USING btree (PROVIDER, provider_usage_synced_at DESC);

CREATE UNIQUE INDEX cloud_organizations_provider_tenant_uidx ON public.cloud_organizations USING btree (PROVIDER, provider_tenant_id);

CREATE INDEX cloud_protected_assets_org_idx ON public.cloud_protected_assets USING btree (organization_id, status);

CREATE UNIQUE INDEX cloud_protected_assets_org_name_uidx ON public.cloud_protected_assets USING btree (organization_id, name);

CREATE UNIQUE INDEX cloud_protected_assets_provider_ref_uidx ON public.cloud_protected_assets USING btree (organization_id, PROVIDER, provider_ref);

CREATE INDEX cloud_provider_sync_runs_org_created_idx ON public.cloud_provider_sync_runs USING btree (organization_id, created_at DESC);

CREATE INDEX cloud_provider_sync_runs_provider_created_idx ON public.cloud_provider_sync_runs USING btree (PROVIDER, created_at DESC);

CREATE INDEX cloud_recovery_org_created_idx ON public.cloud_recovery_tests USING btree (organization_id, created_at DESC);

CREATE INDEX cloud_support_org_status_idx ON public.cloud_support_tickets USING btree (organization_id, status, created_at DESC);

CREATE INDEX cloud_support_ticket_messages_ticket_idx ON public.cloud_support_ticket_messages USING btree (ticket_id, created_at);

CREATE INDEX cloud_support_tickets_org_status_idx ON public.cloud_support_tickets USING btree (organization_id, status, updated_at DESC);

CREATE INDEX company_members_user_idx ON public.company_members USING btree (user_id, company_id);

CREATE INDEX company_talent_shortlist_company_idx ON public.company_talent_shortlist USING btree (company_id, status, created_at DESC);

CREATE INDEX company_talent_shortlist_talent_idx ON public.company_talent_shortlist USING btree (talent_user_id, created_at DESC);

CREATE INDEX course_modules_course_idx ON public.course_modules USING btree (course_id, "position");

CREATE INDEX courses_slug_idx ON public.courses USING btree (slug);

CREATE INDEX ctf_event_challenges_event_idx ON public.ctf_event_challenges USING btree (event_id, "position");

CREATE INDEX ctf_participants_user_idx ON public.ctf_participants USING btree (user_id, joined_at DESC);

CREATE INDEX ctf_solves_event_idx ON public.ctf_solves USING btree (event_id, solved_at);

CREATE INDEX ctf_solves_user_idx ON public.ctf_solves USING btree (user_id, solved_at DESC);

CREATE INDEX enrollments_course_status_idx ON public.enrollments USING btree (course_id, status);

CREATE INDEX enrollments_user_status_idx ON public.enrollments USING btree (user_id, status);

CREATE INDEX job_applications_job_idx ON public.job_applications USING btree (job_id, status, created_at DESC);

CREATE INDEX job_applications_user_idx ON public.job_applications USING btree (user_id, created_at DESC);

CREATE INDEX jobs_company_idx ON public.jobs USING btree (company_id, status, created_at DESC);

CREATE INDEX jobs_public_idx ON public.jobs USING btree (status, published_at DESC);

CREATE INDEX lab_sessions_user_idx ON public.lab_sessions USING btree (user_id, status);

CREATE INDEX lesson_progress_user_idx ON public.lesson_progress USING btree (user_id, completed);

CREATE INDEX lessons_course_idx ON public.lessons USING btree (course_id, "position");

CREATE INDEX lessons_module_idx ON public.lessons USING btree (module_id, "position");

CREATE UNIQUE INDEX one_running_lab_session ON public.lab_sessions USING btree (user_id, lab_id)
  WHERE (status = 'running'::text);

CREATE INDEX payments_reference_idx ON public.payments USING btree (external_reference);

CREATE INDEX payments_user_idx ON public.payments USING btree (user_id, created_at DESC);

CREATE UNIQUE INDEX profiles_email_lower_unique ON public.profiles USING btree (lower(email));

CREATE INDEX subscriptions_preapproval_idx ON public.subscriptions USING btree (preapproval_id);

CREATE INDEX subscriptions_reference_idx ON public.subscriptions USING btree (external_reference);

CREATE INDEX subscriptions_user_idx ON public.subscriptions USING btree (user_id, status);

CREATE TRIGGER fortify_cloud_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fortify_cloud_handle_new_user();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER cloud_onboarding_touch_updated_at
  BEFORE UPDATE ON public.cloud_onboarding_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.cloud_touch_updated_at();

CREATE TRIGGER cloud_organizations_touch_updated_at
  BEFORE UPDATE ON public.cloud_organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.cloud_touch_updated_at();

CREATE TRIGGER cloud_support_touch_updated_at
  BEFORE UPDATE ON public.cloud_support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.cloud_touch_updated_at();

CREATE TRIGGER companies_touch
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER company_talent_shortlist_touch
  BEFORE UPDATE ON public.company_talent_shortlist
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER job_applications_touch
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER jobs_touch
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER lesson_progress_guard
  BEFORE INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_lesson_progress();

CREATE POLICY "challenge_solves_read_own" ON "public"."challenge_solves"
  FOR SELECT
  TO "authenticated"
  USING ((public.current_user_active() AND ((user_id = auth.uid()) OR public.is_admin())));

CREATE POLICY "challenges_read_catalog" ON "public"."challenges"
  FOR SELECT
  TO "authenticated"
  USING ((public.current_user_active() AND (published OR public.is_admin())));

CREATE POLICY "admin_all" ON "public"."cloud_backup_jobs"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "org_access" ON "public"."cloud_backup_jobs"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(organization_id));

CREATE POLICY "admin_all" ON "public"."cloud_incidents"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "org_access" ON "public"."cloud_incidents"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(organization_id));

CREATE POLICY "admin_all" ON "public"."cloud_integration_events"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "admin_all" ON "public"."cloud_leads"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "public_lead_insert" ON "public"."cloud_leads"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

CREATE POLICY "admin_all" ON "public"."cloud_monthly_reports"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "org_access" ON "public"."cloud_monthly_reports"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(organization_id));

CREATE POLICY "onboarding_admin_all" ON "public"."cloud_onboarding_requests"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "onboarding_owner_insert" ON "public"."cloud_onboarding_requests"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "onboarding_owner_select" ON "public"."cloud_onboarding_requests"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = auth.uid()) OR public.cloud_is_admin()));

CREATE POLICY "onboarding_owner_update" ON "public"."cloud_onboarding_requests"
  FOR UPDATE
  TO "authenticated"
  USING (((user_id = auth.uid()) AND (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'needs_info'::text, 'rejected'::text]))))
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "admin_all" ON "public"."cloud_organization_members"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "member_select" ON "public"."cloud_organization_members"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(organization_id));

CREATE POLICY "admin_all_orgs" ON "public"."cloud_organizations"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "org_member_select" ON "public"."cloud_organizations"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(id));

CREATE POLICY "profiles_self_or_admin" ON "public"."cloud_profiles"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_can_view_profile(id));

CREATE POLICY "admin_all" ON "public"."cloud_protected_assets"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "org_access" ON "public"."cloud_protected_assets"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(organization_id));

CREATE POLICY "admin_all" ON "public"."cloud_provider_sync_runs"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "admin_all" ON "public"."cloud_recovery_tests"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "org_access" ON "public"."cloud_recovery_tests"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(organization_id));

CREATE POLICY "support_messages_admin_all" ON "public"."cloud_support_ticket_messages"
  FOR ALL
  TO PUBLIC
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "support_messages_customer_insert" ON "public"."cloud_support_ticket_messages"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((public.cloud_is_org_member(organization_id) AND (author_id = auth.uid()) AND (is_internal = false) AND (author_role = 'customer'::text)));

CREATE POLICY "support_messages_read" ON "public"."cloud_support_ticket_messages"
  FOR SELECT
  TO PUBLIC
  USING ((public.cloud_is_org_member(organization_id) AND ((is_internal = false) OR public.cloud_is_admin())));

CREATE POLICY "admin_all" ON "public"."cloud_support_tickets"
  FOR ALL
  TO "authenticated"
  USING (public.cloud_is_admin())
  WITH CHECK (public.cloud_is_admin());

CREATE POLICY "org_access" ON "public"."cloud_support_tickets"
  FOR SELECT
  TO "authenticated"
  USING (public.cloud_is_org_member(organization_id));

CREATE POLICY "support_insert" ON "public"."cloud_support_tickets"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((public.cloud_is_org_member(organization_id) AND (opened_by = auth.uid())));

CREATE POLICY "companies_member_read" ON "public"."companies"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.is_company_member(companies.id) AS is_company_member) OR ( SELECT public.is_admin() AS is_admin)));

CREATE POLICY "companies_public_read" ON "public"."companies"
  FOR SELECT
  TO "anon", "authenticated"
  USING (((verified = true) AND (active = true)));

CREATE POLICY "company_members_own_read" ON "public"."company_members"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin() AS is_admin)));

CREATE POLICY "company_talent_shortlist_member_read" ON "public"."company_talent_shortlist"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.is_company_member(company_talent_shortlist.company_id) AS is_company_member) OR ( SELECT public.is_admin() AS is_admin)));

CREATE POLICY "course_modules_read" ON "public"."course_modules"
  FOR SELECT
  TO "authenticated"
  USING ((public.current_user_active() AND (public.is_admin() OR ((published = true) AND (EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.user_id = auth.uid()) AND (e.course_id = course_modules.course_id) AND (e.status = 'active'::text))))))));

CREATE POLICY "courses_select_published_or_admin" ON "public"."courses"
  FOR SELECT
  TO "authenticated"
  USING ((COALESCE(published, false) OR public.is_admin()));

CREATE POLICY "ctf_links_read" ON "public"."ctf_event_challenges"
  FOR SELECT
  TO "authenticated"
  USING (public.current_user_active());

CREATE POLICY "ctf_events_read" ON "public"."ctf_events"
  FOR SELECT
  TO "authenticated"
  USING (public.current_user_active());

CREATE POLICY "ctf_participants_read" ON "public"."ctf_participants"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.current_user_active() AS current_user_active) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin() AS is_admin))));

CREATE POLICY "ctf_solves_read" ON "public"."ctf_solves"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.current_user_active() AS current_user_active) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin() AS is_admin))));

CREATE POLICY "enrollments_select_own_or_admin" ON "public"."enrollments"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = auth.uid()) OR public.is_admin()));

CREATE POLICY "job_applications_own_read" ON "public"."job_applications"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin() AS is_admin)));

CREATE POLICY "jobs_company_read" ON "public"."jobs"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.is_company_member(jobs.company_id) AS is_company_member) OR ( SELECT public.is_admin() AS is_admin)));

CREATE POLICY "jobs_public_read" ON "public"."jobs"
  FOR SELECT
  TO "anon", "authenticated"
  USING (((status = 'published'::text) AND (EXISTS ( SELECT 1
   FROM public.companies c
  WHERE ((c.id = jobs.company_id) AND (c.verified = true) AND (c.active = true))))));

CREATE POLICY "lab_sessions_read_own" ON "public"."lab_sessions"
  FOR SELECT
  TO "authenticated"
  USING ((public.current_user_active() AND (public.is_admin() OR ((user_id = auth.uid()) AND public.has_platform_access()))));

CREATE POLICY "labs_read_catalog" ON "public"."labs"
  FOR SELECT
  TO "authenticated"
  USING ((public.current_user_active() AND (public.is_admin() OR ((published = true) AND public.has_platform_access()))));

CREATE POLICY "progress_insert_active_enrollment" ON "public"."lesson_progress"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.lessons l
     JOIN public.enrollments e ON ((e.course_id = l.course_id)))
  WHERE ((l.id = lesson_progress.lesson_id) AND (e.user_id = auth.uid()) AND (e.status = 'active'::text))))));

CREATE POLICY "progress_select_own_or_admin" ON "public"."lesson_progress"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = auth.uid()) OR public.is_admin()));

CREATE POLICY "progress_update_active_enrollment" ON "public"."lesson_progress"
  FOR UPDATE
  TO "authenticated"
  USING ((user_id = auth.uid()))
  WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.lessons l
     JOIN public.enrollments e ON ((e.course_id = l.course_id)))
  WHERE ((l.id = lesson_progress.lesson_id) AND (e.user_id = auth.uid()) AND (e.status = 'active'::text))))));

CREATE POLICY "lessons_select_enrolled" ON "public"."lessons"
  FOR SELECT
  TO "authenticated"
  USING ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.user_id = auth.uid()) AND (e.course_id = lessons.course_id) AND (e.status = 'active'::text))))));

CREATE POLICY "payments_select_own_or_admin" ON "public"."payments"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = auth.uid()) OR public.is_admin()));

CREATE POLICY "profiles_select_self_or_admin" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING (((id = auth.uid()) OR public.is_admin()));

CREATE POLICY "profiles_update_self" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING (((id = auth.uid()) AND (COALESCE(blocked, false) = false)))
  WITH CHECK (((id = auth.uid()) AND (COALESCE(blocked, false) = false)));

CREATE POLICY "site_settings_read" ON "public"."site_settings"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

CREATE POLICY "subscriptions_select_self" ON "public"."subscriptions"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

REVOKE ALL ON FUNCTION "public"."admin_create_challenge"(text, text, text, text, text, integer, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."admin_create_challenge"(text, text, text, text, text, integer, text, text) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."admin_create_challenge"(text, text, text, text, text, integer, text, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."admin_create_challenge"(text, text, text, text, text, integer, text, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."admin_create_challenge"(text, text, text, text, text, integer, text, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."award_lesson_xp"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."award_lesson_xp"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."award_lesson_xp"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."award_lesson_xp"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."cloud_can_view_profile"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."cloud_can_view_profile"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_can_view_profile"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_can_view_profile"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."cloud_is_admin"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."cloud_is_admin"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_is_admin"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_is_admin"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."cloud_is_org_member"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."cloud_is_org_member"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_is_org_member"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_is_org_member"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."cloud_touch_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."cloud_touch_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_touch_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."cloud_touch_updated_at"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."current_user_active"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."current_user_active"() TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."current_user_active"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."current_user_active"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."current_user_active"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."fortify_cloud_handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."fortify_cloud_handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."fortify_cloud_handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."fortify_cloud_handle_new_user"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_ctf_leaderboard"(uuid, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_ctf_leaderboard"(uuid, integer) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_ctf_leaderboard"(uuid, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_ctf_leaderboard"(uuid, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_ctf_leaderboard"(uuid, integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_leaderboard"(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_leaderboard"(integer) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_leaderboard"(integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_leaderboard"(integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_leaderboard"(integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_public_talent_board"(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_public_talent_board"(integer) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_public_talent_board"(integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_public_talent_board"(integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_public_talent_board"(integer) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."guard_lesson_progress"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."guard_lesson_progress"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."guard_lesson_progress"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."guard_lesson_progress"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."has_platform_access"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."has_platform_access"() TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."has_platform_access"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."has_platform_access"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."has_platform_access"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_company_member"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_company_member"(uuid) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_company_member"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_company_member"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_company_member"(uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."submit_challenge_flag"(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."submit_challenge_flag"(uuid, text) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."submit_challenge_flag"(uuid, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_challenge_flag"(uuid, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_challenge_flag"(uuid, text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."submit_ctf_flag"(uuid, uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."submit_ctf_flag"(uuid, uuid, text) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."submit_ctf_flag"(uuid, uuid, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_ctf_flag"(uuid, uuid, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_ctf_flag"(uuid, uuid, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."touch_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."touch_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."touch_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."touch_updated_at"() TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."challenge_solves" TO "authenticated";

REVOKE ALL ON TABLE "public"."challenge_solves" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."challenge_solves" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."challenge_solves" TO "service_role";

REVOKE ALL ("briefing") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("briefing") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("category") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("category") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("created_at") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("description") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("description") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("difficulty") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("difficulty") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("published") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("published") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("slug") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("slug") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("title") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("title") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("updated_at") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("updated_at") ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ("xp_reward") ON TABLE "public"."challenges" FROM "authenticated";

GRANT SELECT ("xp_reward") ON TABLE "public"."challenges" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."challenges" TO "authenticated";

REVOKE ALL ON TABLE "public"."challenges" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."challenges" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."challenges" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_backup_jobs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_backup_jobs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_backup_jobs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_backup_jobs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_incidents" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_incidents" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_incidents" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_incidents" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_integration_events" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_integration_events" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_integration_events" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_integration_events" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_leads" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_leads" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_leads" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_leads" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_monthly_reports" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_monthly_reports" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_monthly_reports" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_monthly_reports" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_onboarding_requests" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_onboarding_requests" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_onboarding_requests" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_onboarding_requests" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_organization_members" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_organization_members" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_organization_members" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_organization_members" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_organizations" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_organizations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_organizations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_organizations" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_protected_assets" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_protected_assets" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_protected_assets" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_protected_assets" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_provider_sync_runs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_provider_sync_runs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_provider_sync_runs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_provider_sync_runs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_recovery_tests" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_recovery_tests" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_recovery_tests" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_recovery_tests" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_support_ticket_messages" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_support_ticket_messages" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_support_ticket_messages" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_support_ticket_messages" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_support_tickets" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."cloud_support_tickets" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_support_tickets" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cloud_support_tickets" TO "service_role";

REVOKE ALL ON TABLE "public"."companies" FROM "anon";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."companies" TO "anon";

REVOKE ALL ON TABLE "public"."companies" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."companies" TO "authenticated";

REVOKE ALL ON TABLE "public"."companies" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."companies" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."companies" TO "service_role";

REVOKE ALL ON TABLE "public"."company_members" FROM "anon";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."company_members" TO "anon";

REVOKE ALL ON TABLE "public"."company_members" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."company_members" TO "authenticated";

REVOKE ALL ON TABLE "public"."company_members" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."company_members" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."company_members" TO "service_role";

REVOKE ALL ON TABLE "public"."company_talent_shortlist" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."company_talent_shortlist" TO "authenticated";

REVOKE ALL ON TABLE "public"."company_talent_shortlist" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."company_talent_shortlist" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."company_talent_shortlist" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."course_modules" TO "authenticated";

REVOKE ALL ON TABLE "public"."course_modules" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."course_modules" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."course_modules" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."courses" TO "authenticated";

REVOKE ALL ON TABLE "public"."courses" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."courses" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."courses" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_event_challenges" TO "authenticated";

REVOKE ALL ON TABLE "public"."ctf_event_challenges" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_event_challenges" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_event_challenges" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_events" TO "authenticated";

REVOKE ALL ON TABLE "public"."ctf_events" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_events" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_events" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_participants" TO "authenticated";

REVOKE ALL ON TABLE "public"."ctf_participants" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_participants" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_participants" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_solves" TO "authenticated";

REVOKE ALL ON TABLE "public"."ctf_solves" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_solves" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ctf_solves" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."enrollments" TO "authenticated";

REVOKE ALL ON TABLE "public"."enrollments" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."enrollments" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."enrollments" TO "service_role";

REVOKE ALL ON TABLE "public"."job_applications" FROM "anon";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."job_applications" TO "anon";

REVOKE ALL ON TABLE "public"."job_applications" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."job_applications" TO "authenticated";

REVOKE ALL ON TABLE "public"."job_applications" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_applications" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_applications" TO "service_role";

REVOKE ALL ON TABLE "public"."jobs" FROM "anon";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."jobs" TO "anon";

REVOKE ALL ON TABLE "public"."jobs" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."jobs" TO "authenticated";

REVOKE ALL ON TABLE "public"."jobs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."jobs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."jobs" TO "service_role";

REVOKE ALL ("connection_url") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("connection_url") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("expires_at") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("expires_at") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("lab_id") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("lab_id") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("started_at") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("started_at") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("status") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("status") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("stopped_at") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("stopped_at") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("target_address") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("target_address") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("user_id") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("user_id") ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ("vpn_download_url") ON TABLE "public"."lab_sessions" FROM "authenticated";

GRANT SELECT ("vpn_download_url") ON TABLE "public"."lab_sessions" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lab_sessions" TO "authenticated";

REVOKE ALL ON TABLE "public"."lab_sessions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lab_sessions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lab_sessions" TO "service_role";

REVOKE ALL ("created_at") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("description") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("description") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("difficulty") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("difficulty") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("estimated_minutes") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("estimated_minutes") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("instructions") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("instructions") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("published") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("published") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("slug") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("slug") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("tags") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("tags") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("title") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("title") ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ("updated_at") ON TABLE "public"."labs" FROM "authenticated";

GRANT SELECT ("updated_at") ON TABLE "public"."labs" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."labs" TO "authenticated";

REVOKE ALL ON TABLE "public"."labs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."labs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."labs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lesson_progress" TO "authenticated";

REVOKE ALL ON TABLE "public"."lesson_progress" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lesson_progress" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lesson_progress" TO "service_role";

REVOKE ALL ("content") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("content") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("course_id") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("course_id") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("created_at") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("module_id") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("module_id") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("position") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("position") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("published") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("published") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("summary") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("summary") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("title") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("title") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("video_url") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("video_url") ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ("xp_reward") ON TABLE "public"."lessons" FROM "authenticated";

GRANT SELECT ("xp_reward") ON TABLE "public"."lessons" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lessons" TO "authenticated";

REVOKE ALL ON TABLE "public"."lessons" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lessons" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lessons" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."modules" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."modules" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."modules" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."modules" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payment_events" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."payment_events" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payment_events" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payment_events" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payments" TO "authenticated";

REVOKE ALL ON TABLE "public"."payments" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payments" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payments" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon";

REVOKE ALL ("github_url") ON TABLE "public"."profiles" FROM "authenticated";

GRANT UPDATE ("github_url") ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ("headline") ON TABLE "public"."profiles" FROM "authenticated";

GRANT UPDATE ("headline") ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ("linkedin_url") ON TABLE "public"."profiles" FROM "authenticated";

GRANT UPDATE ("linkedin_url") ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ("name") ON TABLE "public"."profiles" FROM "authenticated";

GRANT UPDATE ("name") ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ("open_to_work") ON TABLE "public"."profiles" FROM "authenticated";

GRANT UPDATE ("open_to_work") ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ("profile_public") ON TABLE "public"."profiles" FROM "authenticated";

GRANT UPDATE ("profile_public") ON TABLE "public"."profiles" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."site_settings" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."site_settings" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."site_settings" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."site_settings" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscriptions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."subscriptions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscriptions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscriptions" TO "service_role";

