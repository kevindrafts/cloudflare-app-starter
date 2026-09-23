-- Local demo fixtures only. Idempotent: re-running never overwrites edits.
INSERT OR IGNORE INTO projects (id, name, description, status, created_at, updated_at) VALUES
('00000000-0000-4000-8000-000000000001', 'Website refresh', 'Give the studio a new home. Clear story, thoughtful details, and a fast first impression.', 'active', '2026-09-01T12:00:00.000Z', '2026-09-01T12:00:00.000Z'),
('00000000-0000-4000-8000-000000000002', 'Customer interviews', 'Talk to five people about the little things that make their work harder.', 'planned', '2026-09-02T12:00:00.000Z', '2026-09-02T12:00:00.000Z'),
('00000000-0000-4000-8000-000000000003', 'Design foundations', 'A small set of colors, type, and components to keep everything feeling connected.', 'done', '2026-09-03T12:00:00.000Z', '2026-09-03T12:00:00.000Z');
