/**
 * Blocking pre-paint boot for lessons progress (theme-boot style).
 * Keep in sync with `paint-progress.ts`. Reads `#lessons-boot-data` JSON.
 */
export const LESSONS_BOOT_SCRIPT = `(function () {
  var root = document.documentElement;
  root.classList.add("js");

  function ready() {
    root.setAttribute("data-lessons-ready", "1");
  }

  function setText(selector, text) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = text;
  }

  function setWidth(selector, percent) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].style.width = percent + "%";
  }

  function setHref(selector, href) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].href = href;
  }

  function progressPercent(done, total) {
    if (!total) return 0;
    return Math.round((done / total) * 100);
  }

  function lessonHref(lesson) {
    return "/lessons/" + lesson.track + "/" + lesson.slug;
  }

  function nextLesson(completed, list) {
    for (var i = 0; i < list.length; i++) {
      if (!completed[list[i].id]) return list[i];
    }
    return list[0] || null;
  }

  function readCompleted() {
    var map = Object.create(null);
    try {
      var raw =
        localStorage.getItem("slovak.wiki.practice.v1") ||
        localStorage.getItem("slovak-wiki.practice.v1");
      if (!raw) return map;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.completedLessonIds)) {
        return map;
      }
      for (var i = 0; i < parsed.completedLessonIds.length; i++) {
        var id = parsed.completedLessonIds[i];
        if (typeof id === "string" && id) map[id] = true;
      }
    } catch (e) {}
    return map;
  }

  var CHECK_ICON =
    '<svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CHECK_LEFT =
    '<span class="inline-flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">' +
    CHECK_ICON +
    "</span>";

  function checkRight(lessonId) {
    return (
      '<span class="inline-flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" data-lesson-done="' +
      lessonId +
      '">' +
      CHECK_ICON +
      '<span class="sr-only">Completed</span></span>'
    );
  }

  function indexMarkup(status, numberLabel) {
    if (status === "complete") return CHECK_LEFT;
    return (
      '<span class="font-serif text-sm tabular-nums text-slate-400">' +
      numberLabel +
      "</span>"
    );
  }

  function statusMarkup(status, lessonId, completeOnRight) {
    if (status === "complete") {
      if (completeOnRight) return checkRight(lessonId);
      return (
        '<span class="sr-only" data-lesson-done="' + lessonId + '">Completed</span>'
      );
    }
    if (status === "active") {
      return '<span class="inline-flex min-h-8 items-center rounded-(--control-radius) bg-blue-600 px-3.5 text-xs font-bold text-white">Start</span>';
    }
    return '<span class="sr-only">Not started</span>';
  }

  function paintRow(row, lessonId, status) {
    row.setAttribute("data-lesson-status", status);
    row.classList.toggle("border-blue-600", status === "active");
    row.classList.toggle("border-transparent", status !== "active");
    var leading = row.getAttribute("data-lesson-leading") || "index";
    var completeOnRight = leading === "motif";
    if (!completeOnRight) {
      var numberLabel = row.getAttribute("data-lesson-index") || "";
      var indexSlot = row.querySelector("[data-lesson-index-slot]");
      if (indexSlot) indexSlot.innerHTML = indexMarkup(status, numberLabel);
    }
    var slot = row.querySelector("[data-lesson-status-slot]");
    if (slot) slot.innerHTML = statusMarkup(status, lessonId, completeOnRight);
  }

  function paintLevelBars(completed) {
    var sections = document.querySelectorAll("[data-level]");
    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];
      var key = section.getAttribute("data-level");
      var rows = section.querySelectorAll("[data-lesson-card]");
      var total = 0;
      var done = 0;
      for (var r = 0; r < rows.length; r++) {
        var id = rows[r].getAttribute("data-lesson-card");
        if (!id) continue;
        total += 1;
        if (completed[id]) done += 1;
      }
      var percent = progressPercent(done, total);
      var bar = section.querySelector("[data-level-progress-bar]");
      if (bar) bar.style.width = percent + "%";
      if (key) setText('[data-level-done-pct="' + key + '"]', String(percent));
    }
  }

  var dataEl = document.getElementById("lessons-boot-data");
  if (!dataEl) {
    ready();
    return;
  }

  var payload;
  try {
    payload = JSON.parse(dataEl.textContent || "{}");
  } catch (e) {
    ready();
    return;
  }

  var completed = readCompleted();
  var byId = Object.create(null);
  var lessons = payload.lessons || [];
  for (var i = 0; i < lessons.length; i++) byId[lessons[i].id] = lessons[i];

  var tracks = payload.tracks || [];
  for (var t = 0; t < tracks.length; t++) {
    var track = tracks[t];
    var ids = track.lessonIds || [];
    var doneCount = 0;
    for (var d = 0; d < ids.length; d++) {
      if (completed[ids[d]]) doneCount += 1;
    }
    setText('[data-track-done-count="' + track.id + '"]', String(doneCount));
    setWidth(
      '[data-track-progress-bar="' + track.id + '"]',
      progressPercent(doneCount, ids.length),
    );
  }

  var scoped = lessons;
  if (payload.scopedTrackId) {
    scoped = [];
    for (var st = 0; st < tracks.length; st++) {
      if (tracks[st].id !== payload.scopedTrackId) continue;
      var scopedIds = tracks[st].lessonIds || [];
      for (var si = 0; si < scopedIds.length; si++) {
        if (byId[scopedIds[si]]) scoped.push(byId[scopedIds[si]]);
      }
    }
  }

  var focus = nextLesson(completed, scoped);

  if (payload.scopedTrackId) {
    var scopedDone = 0;
    for (var sd = 0; sd < scoped.length; sd++) {
      if (completed[scoped[sd].id]) scopedDone += 1;
    }
    setText("[data-track-progress-pct]", String(progressPercent(scopedDone, scoped.length)));
    if (focus) {
      var allDone = scopedDone === scoped.length && scoped.length > 0;
      setText(
        "[data-track-continue-cta-label]",
        allDone ? "Review lesson" : "Continue learning",
      );
      setHref("[data-track-continue-cta]", lessonHref(focus));
    }
  } else if (focus) {
    var focusTrack = null;
    for (var ft = 0; ft < tracks.length; ft++) {
      if (tracks[ft].id === focus.track) {
        focusTrack = tracks[ft];
        break;
      }
    }
    var trackIds = (focusTrack && focusTrack.lessonIds) || [];
    var lessonNumber = trackIds.indexOf(focus.id) + 1;
    var review = trackIds.length > 0;
    for (var ri = 0; ri < trackIds.length; ri++) {
      if (!completed[trackIds[ri]]) {
        review = false;
        break;
      }
    }
    var trackDone = 0;
    for (var td = 0; td < trackIds.length; td++) {
      if (completed[trackIds[td]]) trackDone += 1;
    }
    var trackHref = "/lessons/" + ((focusTrack && focusTrack.id) || focus.track);
    setText("[data-continue-track-title]", (focusTrack && focusTrack.title) || "");
    setText("[data-continue-lesson-title]", focus.title);
    setText("[data-continue-promise]", focus.promise);
    setText("[data-continue-cta-label]", review ? "Review lesson" : "Continue");
    setHref("[data-continue-cta]", lessonHref(focus));
    setHref("[data-continue-track-link]", trackHref);
    setText("[data-continue-lesson-number]", String(Math.max(lessonNumber, 1)));
    setText("[data-continue-lesson-total]", String(trackIds.length));
    setText("[data-continue-phrase-sk]", focus.phraseSk || "");
    setText("[data-continue-phrase-en]", focus.phraseEn || "");
    setWidth("[data-continue-progress-bar]", progressPercent(trackDone, trackIds.length));
    var motifs = document.querySelectorAll("[data-continue-motif]");
    for (var mi = 0; mi < motifs.length; mi++) {
      var motifEl = motifs[mi];
      var motifId = motifEl.getAttribute("data-continue-motif");
      if (motifId === focus.id) motifEl.classList.remove("hidden");
      else motifEl.classList.add("hidden");
    }
  }

  paintLevelBars(completed);

  var rows = document.querySelectorAll("[data-lesson-card]");
  for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    var row = rows[rowIndex];
    var lessonId = row.getAttribute("data-lesson-card");
    if (!lessonId) continue;
    var status = "upcoming";
    if (completed[lessonId]) status = "complete";
    else if (focus && focus.id === lessonId) status = "active";
    paintRow(row, lessonId, status);
  }

  ready();
})();`;
