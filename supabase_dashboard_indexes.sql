CREATE INDEX IF NOT EXISTS training_runs_project_start_time_idx
ON public.training_runs (project_id, start_time DESC);

CREATE INDEX IF NOT EXISTS models_project_trained_at_idx
ON public.models (project_id, trained_at DESC);

CREATE INDEX IF NOT EXISTS exports_project_exported_at_idx
ON public.exports (project_id, exported_at DESC);

CREATE INDEX IF NOT EXISTS ide_sync_events_project_id_text_idx
ON public.ide_sync_events ((event_data->>'project_id'));
