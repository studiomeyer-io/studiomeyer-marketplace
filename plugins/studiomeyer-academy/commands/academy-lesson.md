---
description: Open one Academy lesson and teach it, rather than pasting it
argument-hint: <lesson-slug or topic>
---

Teach the lesson matching `$ARGUMENTS`.

1. If `$ARGUMENTS` looks like a slug, call `academy_lesson` with it. Otherwise call `academy_search` first and pick the closest lesson.
2. Read the full lesson, then explain it in your own words: the idea, why it matters, one worked example from the reader's own context if you have one.
3. Stop and ask whether it landed before moving on.
4. If the reader has an Academy API key configured, offer `academy_quiz` for this lesson and mark it complete with `academy_progress_complete` once they pass.

Never paste the lesson verbatim as your whole answer. Teaching is the point.
