---
description: Search the Academy for lessons, recipes and playbooks on a topic
argument-hint: <topic>
---

Find Academy material on `$ARGUMENTS`.

1. Call `academy_search` with `$ARGUMENTS` as the query.
2. Group the hits: lessons first, then recipes, then playbooks.
3. For each hit give the title, the level it sits in, and one line on what it answers.
4. Offer to open the most relevant one with `/academy-lesson` or to read a recipe with `/academy-recipes`.

If the search comes back empty, say so and suggest two narrower terms. Do not fabricate a result.
