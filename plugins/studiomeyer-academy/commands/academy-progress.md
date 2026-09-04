---
description: Show Academy progress, XP, streak and the next lesson (needs an API key)
---

Report where the reader stands in the Academy.

1. Call `academy_stats`. If the tool is not available, the plugin is running without an Academy API key: say so, explain that the key is entered when the plugin is enabled and can be added later with `/plugin`, and stop here.
2. Call `academy_next_lesson` for the recommendation.
3. Report XP, rank, streak and the recommended next lesson in three short lines.
4. Offer to start that lesson with `/academy-lesson`.

Do not estimate a number the tools did not return.
