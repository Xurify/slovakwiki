# Decision review (round 4)

This review covers the r4 audits (seven episodes), the cast-r4 critics that had arrived by 16:07 (telling-time, what-bobik-says, imperative, demonstratives, future-tense; there is no possessives or past-tense cast file yet), and r4/engine.md. I read each episode's current script (dumped with scripts/critic/dump-script.test.ts), the cues around each finding in the .ts files, places.ts, door.ts, looks.ts, the r3 decisions, script-critic.md and AGENTS.md (Audio, Acting from cues). I changed nothing in the repo.

Verdicts:

- **KEEP:** the current line or staging stays.
- **CHANGE:** do it, with the final wording given here.
- **ADJUST:** do a different version of the fix, as described.

Staging fixes that conflict with nothing are batched as one CHANGE per episode, so fixers can take them straight from the audit. For each episode, the count in the summary at the end counts each line or story decision separately and each batch as one.

---

## possessives

**1. Lucia as a stranger (green dress): ADJUST. Lucia stays someone they know by sight. Change one line instead of four.**

The hole is real. Marek and Anna greet Lucia by name on the square, yet when Mária reads "Lucia" they don't react at all. The stranger rewrite brings in worse problems:

- **Mária's description can't work.** Mária says "Dnes tu nie je", so she has not seen Lucia today and can't know she is wearing a green dress.
- **The picture doesn't match.** Lucia's look (looks.ts) has green sleeves, not a dress.
- **Strangers contradict the story.** Lucia was in their studio yesterday ("Včera tu boli študenti…", "Vo vašom štúdiu? Aha, áno"). Hosts who don't recognise a guest from the day before, plus "Vy ste z podcastu, však?" and introducing themselves, is less believable than the current version.
- **The cost.** It means four retakes and the loss of the warm "Ahoj, Anna! Ahoj, Marek!".

They met a group of students. They didn't search a small umbrella for a name tag. When they hear the name, they place her. That is ordinary.

- **CHANGE marek-where-find-her:** "Aha, Lucia! Tú poznáme. A kde ju nájdeme?" / "Oh, Lucia! We know her. And where can we find her?" Retake it.
- **KEEP** Mária's line 7, Anna's square line 1, Lucia's greeting and Marek's "Ahoj, Lucia! Hľadáme ťa."

**2. Bridge into the photos segment: CHANGE, but not the auditor's version.**

The auditor's version doesn't work:

- In the photos setup the phone is in Marek's **pocket**, not his bag.
- Seeing a phone is no reason to ask about photos.
- The sentence is long and written.

Give the bridge a visible trigger instead. Marek takes out his phone and looks at it as the segment opens: `{ who: "marek", do: "take", what: "phone", on: "before" }`, plus a look at it. Anna reacts to what she sees:

- **anna-back-weekend-photos:** "Sme späť v štúdiu. [pause] Marek, čo si to tam pozeráš? Fotky od rodičov z víkendu?" / "We're back in the studio. Marek, what are you looking at? Photos from your parents' place at the weekend?"
- **marek-photos-in-phone:** "Áno. Chceš ich vidieť?" / "Yes. Want to see them?"
- **anna-show-me** "Ukáž, ukáž!" stays. Move any later `take phone` cue so it isn't taken twice.

**3. "svoj nemôže byť v podmete" (game line 14): KEEP.** The auditor's "A svoj v podmete nikdy nie je" is no clearer, and the English already says "Brat is the subject here". A gloss of "podmet" would turn Anna into a teacher.

**4. English "(a student's sentence)" on lines 9 and 13 only: KEEP (finding is wrong).** Tagging only the wrong sentences gives the answers away to anyone reading the English. The English is meant to be the plain meaning.

**5. Nit 3, "Moja auto je staré" for variety: KEEP.** "Moja brat" against "Svoj brat" on the same noun is a deliberate minimal pair. Changing it re-records an ask and its branch lines.

**6. Nit 4, cut Marek's "Dovidenia!" at the school: KEEP.** Three people each saying goodbye is real, and it takes a second.

**7. Nit 2, name náš/váš/ich in the topic line: KEEP.** Eight pronouns in a row is a table read aloud.

**8. Nit 1, the ask card quotes the preamble ("Tak dobre… Prvá veta:"): CHANGE.** Quote only the sentence.

**9. Staging: CHANGE these:**

- **Held-prop taps open no card:** engine item 1.
- **Umbrella held clear of the mic:** keep it on the side away from the boom, and aim Anna's point at its box.
- **The quiz sheet:** raise it between his face and the mic, and add `look to: sentences` on lines 5, 9, 13 and 17.
- **Arrivals:** walk in through the school's Vchod door, and stand on "poďme" at the ends of segments 1 and 2. The registration place has no DOORS row (door.ts). Adding one fixes this and past-tense's school exit. If that is too much for this round, walk on from the edge.
- **Rain:** `{ do: "point", to: "dvere", on: "prší" }`. Rain in the porthole is optional engine work and not needed for 9.
- **Climax:** raise the umbrella to head height on "môj". On marek-only-till-tomorrow, Anna does `stand` and `leave to: door` on `after`, umbrella in hand. Use an "open" state only if the engine already has one; don't build it now.
- **Verify** which take of "Ahojte!" the outro plays.

**10. Lucia covers the café: ADJUST.**

- If a chair piece can be added to PLAZA_SET cheaply, start her seated at a café table and have her stand on "Lucia". Only this episode and what-bobik-says use the plaza.
- Otherwise start her beside the café tables, not in front of the KAVIAREŇ sign.
- For the LEKÁREŇ sign, **lift the fascia above head height** rather than moving spots. The what-bobik-says audit wants the plaza spots moved about 80 px right, which would put the cast in front of the café and fountain instead.

**11. Bell press on arrival: ADJUST.** Do it only if a touch verb with a ding already exists. Don't add a verb for it.

**12. Plaza sounds: ADJUST.** Add a fountain or water layer if one exists, and keep the tram. A tram heard near an old-town square is realistic, and what-bobik-says plays there too.

---

## telling-time

**1. The ending callback: ADJUST.** The auditor is right that the ending only repeats the lesson. The proposed fix has two problems:

- **Wrong callback.** "Nie o pol štvrtej" points at the wrong mistake: the morning mix-up made him an hour late, not half an hour.
- **More repetition.** It adds a third line that restates the same rule.

The callback that pays off is Marek's "Som tu včas!" from the first scene, which he said when he was an hour late. (Lateness does come back on some game paths, at lines 11, 37 and 39, but not on every path.)

- **CHANGE marek-at-three-now-i-know:** "O tretej, nie o tri hodiny. A budem tu včas!" / "At three, not in three hours. And I'll be here on time!" Give it confident or happy delivery; drop the chuckle.
- **NEW, Anna [chuckles]:** "Ako dnes ráno?" / "Like this morning?"
- **NEW, Marek [chuckles]:** "No… [STOP] lepšie ako dnes ráno." / "Well… better than this morning." Use STOP, not an ellipsis read as trailing off.
- Then give a beat (`wait` of about 1000 ms) before anna-thanks-bye, so the joke has its pause before the goodbyes.

**2. Quiz recast, check-close-form: KEEP.**

- **The contrast is already tested.** The café already has a meaning check on the same contrast (check-guest-when: o tretej against o tri hodiny), so a second one duplicates it.
- **The new distractor is weak.** "O šiestej ráno" is a throwaway.
- **The gap check already teaches meaning.** Its whyWrong explains what "o šesť hodín" means.

**3. Quiz recast, check-su-form: KEEP.** The proposed "Koľko je hodín na Anninom telefóne?" with "Sú dve hodiny" / "Je dve hodiny" is still a form check. It is also a trick question, because two of the choices name the same time. The lesson segment already has a meaning check (check-quarter-past-two).

**4. Nit 2, "Je jedenásť hodín a päť minút": CHANGE** marek-eleven-oh-five to "Je jedenásť nula päť." / "It's eleven oh five." Mark the whole time. Marek is the numbers man ("čísla mi idú, ale slová nie"), and this is how people read a clock aloud. Add the cast's `{ do: "look", to: "hodiny", on: "start" }`.

**5. Nit 3, the outro check prompt "O koľko príde hosť?": CHANGE** it to "Za ako dlho príde hosť?". In speech, "o koľko" is often heard as "at what time" (o koľkej), which points away from the right answer. The prompt is text only.

**6. The waiter's cups: ADJUST.** The current cue comment says the chairs keep the waiter from reaching the table top.

- Preferred, as decided in round 3: the waiter puts each cup on the table at its drinker's side, from the table's end.
- If `space/out-of-reach` blocks that, use the auditor's version: give anna-cup to Anna, and put marek-cup on the table himself.
- No guest passes a cup across.

**7. Recorder back from the café: CHANGE** to `{ who: "anna", do: "take", what: "recorder", on: "ideme" }` on line 15. **Do not** add a second recorder to the studio setup: the studio already draws a diktafón, which stands for it.

**8. Clock-face bubble over Marek: ADJUST.** By the engine's convention (AGENTS.md, `show`), the bubble sits over the head of the one looking, as it does over Anna in the possessives photos. Keep that convention, and fix the parts that are wrong:

- at least twice the size (40 px or more at 390);
- clear of the nápis box;
- Marek's `look to: anna-phone` from line 6, with the phone held out between the mics.

Don't draw this one clock on the phone screen as a one-off.

**9. Staging and audio: CHANGE these.**

- Dead air: sit on "včas"; the waiter's takes move to his return; in the café, Anna's enter on "start" and Marek's on "kaviareň". The cue comment there says the opposite; Anna saying "Tu je naša kaviareň" as she walks in is natural, so update the comment.
- The waiter's arm over Anna: give him a spot further from her chair, plus a nod.
- Looks to the street and café clocks, and the hosts facing each other at the stop.
- Marek's mug gag.
- Retakes of "Pravda… A ja som chcel ešte jednu" and "Hlavne, že sme stihli kávu".
- Tap order: engine item 5.
- Nits: the walk-on at the stop (it sells "Uf, stihli sme to"); listen to "Pozeráme" and "To si povedal ty".

---

## demonstratives

**1. "Jasné, že ho poznám!" contradicts "kto je ten muž vonku?": CHANGE** marek-who-is-that-woman to "Aha, už ho spoznávam! A kto je tá žena pri ňom?" / "Oh, now I recognise him! And who's that woman next to him?" Retake it.

- Anna's "Veď toho muža poznáš!" stays. It feeds check-toho and game line 34.

**2. Add "Táto je prázdna" to "V tejto?": KEEP "V tejto?".**

- "V tejto?" / "Nie, v tamtej." is quick and real.
- If Marek has already said the near bag is empty, Anna's "Nie" answers nothing.
- He would also have to be shown looking into the bag.

This is the forcing-grammar case.

**3. "To sú naozaj milí ľudia" instead of "Tí ľudia sú naozaj milí": KEEP.**

- "Tí ľudia" is the story's only tí.
- It sets up Anna's game rule, "Tí patrí k slovám ako muži, chlapci, ľudia", word for word.

Moving tí to Anna's line 13 ("tí ľudia sú zlatí") would only repeat Marek. The grammar page listing táto/tamto/To sú is not a reason to force each one into the story.

**4. Marek's quiz excuse: CHANGE** marek-never-get-these to "Ojoj. Na trhu mi to išlo, ale na skúške mám vždy trému." / "Uh-oh. It went fine at the market, but tests always make me nervous."

- It explains why he needs help after using the forms all day, and test nerves are true to life.
- The auditor's "Pri trhu" is the wrong preposition. Anna's counter-line version would add a line.

**5. Card payment: ADJUST.**

- **Rejected:** "Kartou, prosím" with a phone `show`. `show` draws a picture bubble, there is no terminal, and saying "kartou" at a farm stall needs a question first ("Môžem kartou?").
- **CHANGE anna-thanks-goodbye** to "Nech sa páči. Ďakujeme, dovidenia!" / "Here you are. Thank you, goodbye!" Anna gives Lucia a banknote on "páči" (meet), and both wave on "dovidenia".
- There is no money or card ObjectKind in acts.ts, so this needs a small new prop kind. If that can't be done this round, **keep the line as it is**: "Nech sa páči" with empty hands is worse than no payment.

**6. Staging: CHANGE these.**

- **Leaving Anna's flat:** Anna steps aside first, then both leave by the door; Marek doesn't pass through her.
- **Points:** they clear Marek. "Je v tej taške" aims down at the bag (engine item 13).
- **Strawberry basket:** it starts at the far crate.
- **Cheese:** redraw it. The market backdrop's "syr" also appears in past-tense, and the redraw is an improvement there too.
- **"Aha, mám ho":** it starts on the take.
- **Looks:** at the window, the man and the woman, and to each other.
- **Outro key:** take on "start", raise on "vrecku", Anna looks.
- **Game:** a shrug on "ojoj" and Marek turning front on "vy".

**7. Walk off the market and in at home: ADJUST.** Walk off left on "tebe". The home door in door.ts has `keys: true`, so a door entry plays an unlock first. The only keys object in this scene is Marek's car key in the window bag.

- Either enter without the unlock,
- or give Anna her own keys object that is pocketed at once.

Don't use the car key: it must stay in the bag until "Aha, mám ho".

**8. "A teraz sme u mňa doma": KEEP** (round-3 nit 5). It is fine for a podcast on location, and with the walk-in it is said while entering.

---

## future-tense

**1. Nit 1, "Veď ste nám v nedeľu volali": KEEP** (as decided in round 3). The robot answering literally is the point. The proposed "…pamätáte?" has the robot asking his owner whether he remembers a call from two days ago, which is odder.

**2. Nit 2, the whyWrong of check "Domo kúpil novú loptičku": CHANGE** its English to "Nobody bought a ball: it is Dunčo's own ball from home."

**3. Nit 3, right answer first on the ask card: verify before changing.** The telling-time auditor saw the choices shuffled; the imperative auditor saw a fixed order. If the order is fixed, that is a player-wide decision, not this episode's.

**4. Climax: ADJUST.** The auditor puts a jump on line 6 _and_ a run on "poď" in line 7. If the dog is already at Marek's feet, "Poď sem!" makes no sense.

- **Line 6:** Dunčo jumps toward Marek where he stands at the window, with a wag (excited barks).
- **Line 7:** on "poď", Dunčo runs to him (`run: true`). Marek kneels when he arrives, on "chýbal".
- **Photo on "Ako na tej fotke": KEEP the line, add nothing.**
  - The listener saw the photo being taken.
  - Showing it to Domo, who is in it, is odd.
  - It would need a new picture drawing.

**5. The sad dog: CHANGE, with one correction.**

- Droop on every whine. Lie down on domo-not-even-the-ball.
- Use spot `dunco-window` (x128, made to be in frame on a phone), not `window-dog` (x118, at the frame edge). Also move the morning `go to: window-dog` there, or move window-dog right.
- **Don't** stand him up on line 7, the sighed "Haf." after "Budem čakať s tebou", as the auditor proposes: a wag on a sighed bark contradicts the line. Stand and wag on "spolu" in domo-we-will-wait-together (line 9, happy), as the cast critic proposes.

**6. Staging: CHANGE these.**

- **Growls:** use `growl` at Domo for both "Vrrr…".
- **Morning sulk:** lie down facing Domo, then look at Anna.
- **The ball:** given on "tebe" in anna-he-likes-you.
- **The thanks barks:** face Domo for them.
- **Spots:** Domo off the lamp post.
- **The chase:** one continuous run (or engine item 9).
- **Eating:** nose over the bowl, not paws.
- **Suitcase:** drop Marek's `take suitcase` on "Šťastnú cestu!". In segment 6 he puts the case down by the door, not mid-rug. It arriving with him is right: he is back from London.
- **Dead air:** cues earlier.
- **Retakes:** "Dunčo. Budeš mi chýbať…" (50%) and "Počkaj, Dunčo… správa…".
- **Engine:** Anna's floor pickup (item 2) and park taps (item 11).

---

## past-tense

**1. End card "Koniec. Ďakujeme, že počúvate.": CHANGE** to "Koniec. Ďakujeme, že ste počúvali." / "The end. Thank you for listening." At the very end, after the story, that is the usual form. It matches future-tense's end card, and a clip of that text already exists.

**2. The waiter's "Áno, ale ten je náš!": KEEP.** The auditor's "Áno, a predávam ho, nie kradnem!" is clumsy Slovak (it would be "nekradnem ho"). It also turns Anna's light hint into a theft accusation she never made. The current line is a mildly indignant waiter, and Anna's "To je pravda." closes it.

**3. English of line 2.2, "Hello, Mrs Mária": KEEP.** "Mrs" before a first name is not English usage.

**4. Line 6.2 "Ja už viem, kto zjedol koláč": KEEP** (the auditor agrees). **Answer card gloss: KEEP.** Names need no gloss; "Čašník" does.

**5. Anna's coffee: ADJUST.** Give Anna her own cup (held after the skip, put down on "Tak." clear of the hrnček). **Don't remove the red mug:** "hrnček" is part of the studio drawing in every studio episode.

**6. Staging: CHANGE these.**

- Entries on the cards (café and studio return).
- The school exit on "end". Leave by the door if registration gets a DOORS row (shared with possessives).
- The "koláč" retake.
- The café arrow order (engine item 6).

**7. Acoustic panels tappable: ADJUST.** This changes the studio set for every episode. Add it only as a studio-wide thing with its own clip, not as a fix for this episode.

---

## imperative

**1. Nit 1, the clock reads 8:00 against "Je strašne skoro": KEEP.** Eight is "terribly early" for sleepy Marek, and that is the joke of his character. Neither the line nor the clock needs to change.

**2. Nit 3, English: CHANGE both.**

- Intro line 12: "Oh yes! She'll show us how she makes that soup of hers. And Lucia's coming too, right?" "Ukáže" is a perfective future.
- check-sadnite feedback English: "Sit down. And still no Lucia? She was supposed to come.", matching the line.

**3. Nit 5, move the sign-off after the plant beat: KEEP.** Signing off and then remembering the plant is the post-sign-off gag that possessives and demonstratives also use. Anna's "polejte si rastlinky! Majte sa pekne!" already closes after the payoff.

**4. Staging: CHANGE these.**

- **Watering:** Marek's watering spot moves left of the pot, and the can's put moves into Anna's line, so the punchline comes about 0.5 s after "nezaspi".
- **Kitchen spots:** the counter-end and middle spots move clear of the fridge, 45 rig units apart.
- **Kitchen paths:** the pot and salt paths stop going through Anna and Mária (cast blockers 1 and 2).
- **Game:** acts, including the look at the yellow plant.
- **Cast nits:** take all of them.
- **Retakes:** "Tak sa vyspi aj dnes!" (still 50%, already decided in round 3) and "Tak ju hneď polej, chudinku." "Hej, hej" stays, as round 3 decided.

---

## what-bobik-says

**1. Nit 1, "Dobre. No nič… Kde mám kľúče?": KEEP.** "Dobre, no nič…" ("right then…") is very common spoken Slovak before someone sets off. It is not a doubled bridge.

**2. Nit 2, "Hladný? Konečne!": KEEP.** It echoes Bobík's "konečne", and it is Marek's relief that the dog will finally eat after "Celý večer nejedol".

**3. The segment-5 walk-in: ADJUST.** Don't add an off-stage "Bobík? Som doma…" line: a muffled voice through a door is a new device for one gap. Start Marek's enter during the card, and give him a shorter walk to a spot just inside the door. Anna's leave starts on "musím": CHANGE.

**4. Plaza spots 80 px right: ADJUST.** That shift puts the group in front of the café and fountain, which possessives needs to show. Lift the LEKÁREŇ fascia instead (shared with possessives). A shift of about 30 px is fine.

**5. Bobík at the window: CHANGE**, with `dunco-window` rather than `window-dog`, as in future-tense finding 5. Add `look to: okno` on the card and on "ulicu". His existing turn to Robo on "marek" stays.

**6. Small barks at −30.6 LUFS: CHANGE** as in engine item 10 (approved). Raise them to about −24 LUFS. Then a person listens at phone volume with Background sound on: the quiet "Haf." must still sound smaller than a full bark, which is its point.

**7. Staging: CHANGE these.**

- **Exit on the square:** Robo goes first, then Bobík, and the lead stays attached (engine item 3).
- **The lead scene:** Bobík goes under the lead and looks up (engine item 4), and Robo no longer overshoots the pegs.
- **Facing:** Anna and Robo face each other, and Robo looks down at Bobík on the square.
- **Last line:** Robo faces and points at Bobík.
- **Dog acting:** droops on the three sighed barks, a jump at the reunion, and Bobík sits on the square after his bark.
- **Eating:** the bowl-mat-dog dx changes to about −28. Only this episode uses that spot, so no other episode regresses.
- **Marek:** he stands on "zmena".
- **Duration label:** engine item 12.

**8. Person tap targets: ADJUST, not this round.** It would change every episode's cast and is not a blocker. Making the held lead open its card is engine item 1.

---

## Findings I think are wrong or not worth the cost

- **possessives, Lucia as a stranger:** it brings in a description Mária can't know, a dress Lucia doesn't wear, and hosts who forgot yesterday's guest.
- **possessives, the bag-and-phone bridge:** the phone is in his pocket, and seeing a phone isn't a reason to ask for photos.
- **possessives, the English tag on only the wrong quiz sentences:** it gives the answers away.
- **telling-time, "Nie o pol štvrtej":** it calls back the wrong mistake.
- **telling-time, both quiz recasts:** one duplicates an existing meaning check; the other is a trick question.
- **telling-time, moving the clock bubble off Marek:** this goes against the engine's `show` convention.
- **telling-time, a recorder in the studio setup:** the studio already draws a diktafón.
- **demonstratives, "Táto je prázdna" and "To sú…":** both force grammar, and the second loses the tí that the game builds on.
- **demonstratives, card payment by phone `show`:** it draws a photo bubble, and there is no terminal.
- **past-tense, the waiter's "nie kradnem":** clumsy Slovak and a sharper accusation.
- **past-tense, removing the red mug:** it is the studio's drawn hrnček in every episode.
- **future-tense, standing the dog up on the sighed "Haf.":** this contradicts the sigh.
- **future-tense, the jump and the run on consecutive lines:** together they make "Poď sem!" meaningless.
- **what-bobik-says, plaza spots 80 px right:** this hides the café that possessives needs.
- **what-bobik-says, an off-stage "Som doma":** a new device to fill one gap.

## Summary of CHANGEs

| Episode         | CHANGEs                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| possessives     | 5: marek-where-find-her; the photos bridge (2 lines); the ask-card quote; the staging batch                                      |
| telling-time    | 6: the outro callback (1 changed and 2 new lines); marek-eleven-oh-five; the outro check prompt; the recorder; the staging batch |
| demonstratives  | 4: marek-who-is-that-woman; marek-never-get-these; anna-thanks-goodbye with payment (only with a money prop); the staging batch  |
| future-tense    | 3: the whyWrong English; the sad dog (with the corrected stand); the staging batch                                               |
| past-tense      | 2: the end card; the staging batch                                                                                               |
| imperative      | 2: the English fixes (2 strings); the staging batch                                                                              |
| what-bobik-says | 4: Anna's leave on "musím"; Bobík at the window; the small barks; the staging batch                                              |
