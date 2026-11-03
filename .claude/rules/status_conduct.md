---
paths:
  - ".status/**"
---

# Working in .status/

- `.status/` is gitignored: the only copy is on this machine. Never delete,
  move, or rewrite a file here without asking first. Appending is fine.
- Every markdown file written here opens with a `For humans:` summary - three
  or four sentences at the very top: what the file is and what a person needs
  to take from it.
- The root holds only `README.md`, `decisions.md`, `development_history.md`,
  and `local-environment.md`. New material goes in `plans/`, `prompts/`,
  `notes/`, or `scratch/`.
- `README.md`, `plans/`, and `prompts/` are the files that change in place
  (a status line, a ticked box, the README's current state and `Next` list);
  a wholesale rewrite still needs asking first, as the first bullet says.
  `notes/` is write-once. `decisions.md` and `development_history.md` are
  append-only: add an entry, never rewrite or delete one.
- `archive/` has four places, and nothing goes anywhere else in it:
  a finished plan moves to `archive/completed_plans/` and a finished prompt
  to `archive/completed_prompts/`, each renamed
  `archived_YYYY-MM-DD_<name>` with the day it was archived (split a plan's
  still-open boxes into a new plan first, and add a `development_history.md`
  entry); when the year turns, notes move to `archive/completed_notes/`
  with their names unchanged; anything else goes to `archive/other/<year>/`,
  names unchanged.
- Temporary scripts, experiments, and one-off test files go in
  `.status/scratch/` - never the repository root. `scratch/` may hold any
  file type and is deleted unread; everywhere else is markdown only.
- Do not read `archive/` unless a file is named for you.
- Filenames: lowercase ASCII, `_` as separator. Every note is
  `YYYY-MM-DD_slug.md` (date first); a note without a leading date is
  renamed, never left. Plans and prompts are `slug.md` - no date, no status
  word in the name - until they are archived.
