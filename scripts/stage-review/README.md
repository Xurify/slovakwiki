# Stage review tools

These tools look at an acted stage segment without recording it in real time. They need the dev server running (`bun run dev`).

```sh
# Frames of a segment on Playwright's virtual clock, 6 a second at 2x (index.json says each frame's time and line)
node scripts/stage-review/render-frames.cjs --segment "U Márie" --out /tmp/frames/kitchen

# Motion-critic strips straight from those frames, only for the lines whose cues changed
python3 scripts/stage-review/frame-strips.py /tmp/frames/kitchen /tmp/strips/kitchen --lines 5-7

# One triage table from the critics' JSON-line replies
python3 scripts/stage-review/merge-findings.py critic-*.txt --out triage.md
```

After a fix, render only the lines whose cues changed and the line after each (`--lines 5-7`, same as `--from 5 --to 7`) instead of the whole segment. Start long renders with `run_in_background` and carry on; you are told when they exit, so do not poll the log in a loop. Name the segment exactly (a loose regex can pick the wrong one), and never use `pkill -f`, which can kill your own shell: stop the one process by its pid.

## How it stays true to the browser

- **Line timing.** The clock is paused and moved with `runFor`, so every timer and animation frame fires in order. Sound is off, so each line lasts its clip's length on timers rather than waiting on the audio element's real-time events. Runs are repeatable to the millisecond. Compared with a real-time run, lines start about 0.1 s earlier per line, because a busy browser adds small delays between one line and the next. Frames within a line match the real-time run.
- **CSS transitions.** Walks, turns and the camera are CSS transitions, and those run on the real clock. Without a fix, a frame would show a walk ahead of or behind the timers. After every 1/30 s step, `__syncAnimations` takes each transition off the real clock and sets it to the virtual time.
- **Layout.** The stage is pinned to the viewport's corner, because playing a line scrolls the page.
- **Workers.** Each worker plays the segment from line 1 and takes frames only for its own range, so what people hold and where they stand is the same as in a single run (a seek to a later line resets held props, which once made a phone and a bag seem to vanish). Line times match a single run exactly, and frames differ by a few hundred pixels at the median from a single run. Replaying costs time: with ten lines in a range, three workers took as long as one. `--replay 0` warms up on the one line before instead, which is faster for long segments but resets held props; use `--workers 1` or the default when props matter.

On the kitchen (21 lines, 128 s of stage), rendering took 46 s with 4 workers on a 4-core container and 88 s with one worker. All four acted segments of the imperative episode (304 s) took 113 s. Recording them in real time took about 7 minutes, plus 1.5 minutes to make mp4s and ffmpeg time to cut strips.

## Voices

Frames are silent on purpose. For the video Xurify reviews, record in real time once the gate is clean. The dev server gets missing clips from R2 (`src/integrations/audio-dev-fallback`). A thread linked to Xurify's computer can't reach R2, so its videos have no voices: record from a thread that isn't linked.
