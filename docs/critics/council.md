# The council

Questions the writer would otherwise take to Xurify go to the council: five reviewers who each answer alone. Xurify sees the work once it is regenerated and ready to verify, with the council's verdicts listed in the PR, and never a question that the council could have answered.

## What goes to the council

- A critic finding that the writer wants to reject.
- A doubt the script critic put under **Ask a native**.
- A choice between drafts, such as the three blind openings or endings.
- A choice of scope: cutting a segment, adding a place, moving a game.

What stays with a person, at review time and not before: how a voice sounds, how a line is delivered, and the final verdict on the episode. Put those in the PR's **Listen back** list.

## The members

Each member is a fresh agent started with `model: "sonnet"`; an agent started without it runs on the writer's model, and Opus validators took 6 to 11 minutes where Sonnet took 2.5. A member gets the question, the options and the evidence (script tables, contact sheets) and nothing else: no plan, no grammar goals, no other member's answer, and no word on which option the writer prefers.

1. **Native ear.** An adult Slovak editor. Is it correct, and is it what a Slovak would say here, in this register? When unsure, says so instead of guessing.
2. **First-time viewer.** Watches the episode once. Does the story hold together, does the picture match the words, does each scene end naturally and the episode end with a laugh?
3. **Teacher.** Teaches A1–A2 learners. Will a learner come away with the right form and the right rule, or will they learn something false? Games and quizzes come after the forms are heard.
4. **Xurify's eye.** Answers as Xurify would, from Xurify's reviews: naturalness and realism come first. No line exists to carry a form. Every place has a reason, every set looks like what it claims to be, and every prop comes from somewhere. Turns are bridged with a filler. Nobody knows what they were not told. Endings get a set-up, a pause and a reaction. Fewer, richer scenes beat many thin ones.
5. **Devil's advocate.** Makes the strongest case for the option the others are least likely to pick. Then gives its own vote.

## The brief each member gets

```text
You are on a review council for a short animated Slovak listening
episode for A1–A2 learners. Your role: [role, from docs/critics/council.md].
Answer alone; you will not see the other members.

Question: [the question, neutral, with no hint of a preference]
Options:
  A. [option and what follows from it]
  B. …
Evidence: [script table rows, frames, the finding being disputed]

Reply with:
- Vote: A, B, … or "none of these", with a better option in one line.
- Confidence: 1 (a lean), 2 (fairly sure) or 3 (certain).
- Blocker: yes if the options you did not pick would be a mistake that a
  viewer or a learner would notice. Say which option and why.
- Reason: at most four sentences. Quote the line or frame.
- Language: if your answer depends on a claim about Slovak, say how sure
  you are of that claim.
```

## How the council decides

1. Add up the votes, each weighted by its confidence. The option with the most weight wins.
2. Run a second round when the vote is within one point, or when someone flags a blocker against the winner. A blocker on a language question counts only from the native ear, and a blocker on taste only from Xurify's eye. In the second round every member sees the others' reasons, without names, and votes again. The second round decides.
3. A tie after the second round goes to Xurify's eye.
4. When a language claim stays uncertain, do not teach that form as right or as wrong. Pick an example nobody disputes.

Record each decision in the PR under **Council**: the question, the options, the votes, the verdict and any dissent, each in one line.
