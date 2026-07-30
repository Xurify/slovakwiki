# Guided grammar and pronunciation references

## Problem

Grammar and pronunciation concepts use the same content type and page template as dictionary words. Their pages open like definitions, so their purpose is unclear.

## Direction

Keep the sections browseable, but organize each as a guided reference that can become a course later. Do not add accounts, progress tracking, locked content, or interactive drills.

## Grammar

The grammar hub introduces a foundation path and groups concepts into nouns, verbs, and sentences. Each concept page explains one rule, shows a pattern, gives examples, calls out a common mistake, and points to a next concept.

## Pronunciation

The pronunciation hub introduces a sound path: rhythm, vowels, consonants, then diacritics and combined sounds. Each page states a hear-and-say goal, presents sound contrasts, gives a physical cue, provides practice words and a phrase, and points to a next sound.

## Dictionary

Dictionary remains a lookup-oriented reference for individual words. Its existing detail page remains specific to vocabulary.

## Architecture

Replace the shared grammar/pronunciation use of `ContentEntry` and `EntryDetail` with section-specific content types, hubs, and detail templates. Share only small primitives where the visual role is genuinely the same.
