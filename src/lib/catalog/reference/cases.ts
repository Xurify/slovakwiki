import { languageSource } from "../sources";
import type { CaseTopic } from "../types";

export const caseTopics: CaseTopic[] = [
  {
    slug: "nominative",
    name: "Nominative",
    question: "Kto? Čo? · Who? What?",
    summary:
      "The nominative names the subject: the person, thing, or idea doing the action.",
    body: [
      "Use nominative for the subject of a sentence. It answers who or what performs the action.",
      "In Peter číta knihu, Peter is nominative because Peter performs the reading. The object knihu uses a different case.",
    ],
    examples: [
      {
        slovak: "Peter číta knihu.",
        english: "Peter is reading a book.",
        note: "Peter is nominative because he performs the action.",
      },
      {
        slovak: "Mesto je veľké.",
        english: "The city is large.",
        note: "Mesto is nominative because it is the subject being described.",
      },
    ],
    researchPrompts: [
      "Collect three nouns in nominative from your own Slovak reading.",
      "Compare a masculine, feminine, and neuter noun in the nominative.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "genitive",
    name: "Genitive",
    question: "Koho? Čoho? · Whose? Of what?",
    summary:
      "The genitive marks possession, amounts, absence, and several common prepositional relationships.",
    body: [
      "Use genitive for possession and relationships between nouns. It also appears after words for amounts and after negated byť or mať in some expressions.",
      "Common prepositions such as z, od, do, and bez regularly introduce the genitive. Learn each preposition with a useful phrase.",
    ],
    examples: [
      {
        slovak: "Som z Kanady.",
        english: "I am from Canada.",
        note: "z takes the genitive: Kanada becomes Kanady.",
      },
      {
        slovak: "Pohár vody.",
        english: "A glass of water.",
        note: "vody identifies what the glass contains.",
      },
    ],
    researchPrompts: [
      "Notice one genitive phrase with z, od, do, or bez.",
      "Build a phrase showing possession or amount.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "dative",
    name: "Dative",
    question: "Komu? Čomu? · To whom? To what?",
    summary:
      "The dative marks the person or thing that receives, benefits from, or is affected by an action.",
    body: [
      "Use dative for an indirect object: the person or thing something is given, said, or done to.",
      "Some verbs and expressions select the dative without a visible preposition. Learn the form with the verb that governs it.",
    ],
    examples: [
      {
        slovak: "Dám Petrovi knihu.",
        english: "I will give Peter a book.",
        note: "Petrovi is the recipient.",
      },
      {
        slovak: "Pomáham mame.",
        english: "I am helping my mother.",
        note: "mame is the person receiving help.",
      },
    ],
    researchPrompts: [
      "Find a verb that takes a person in the dative.",
      "Compare a dative recipient with an accusative object.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "accusative",
    name: "Accusative",
    question: "Koho? Čo? · Whom? What?",
    summary:
      "The accusative marks the direct object: the person or thing directly affected by an action.",
    body: [
      "Use accusative for what or whom you see, have, want, read, or otherwise act on directly.",
      "For many feminine nouns, the accusative ending differs from the nominative. Learn the object form inside a complete phrase.",
    ],
    examples: [
      {
        slovak: "Mám kávu.",
        english: "I have coffee.",
        note: "kávu is the direct object of mám.",
      },
      {
        slovak: "Vidím mesto.",
        english: "I see the city.",
        note: "mesto is the thing directly seen.",
      },
    ],
    researchPrompts: [
      "Underline the direct object in three Slovak sentences.",
      "Practise one feminine noun in nominative and accusative.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "locative",
    name: "Locative",
    question: "O kom? O čom? · About whom? About what?",
    summary:
      "The locative is used after selected prepositions for location and for talking about a person or topic.",
    body: [
      "The locative appears with prepositions such as v, na, and o. It is not used on its own; the preposition helps determine the meaning.",
      "Use it for where something is and for the topic of speech or thought. Learn the preposition and noun as a pair.",
    ],
    examples: [
      {
        slovak: "Bývam v meste.",
        english: "I live in the city.",
        note: "v meste expresses a location.",
      },
      {
        slovak: "Hovorím o škole.",
        english: "I am talking about school.",
        note: "o škole marks the topic.",
      },
      {
        slovak: "Stretneme sa o tretej.",
        english: "We will meet at three.",
        note: "o + locative for a clock time. For a duration (in two hours), o takes accusative: o dve hodiny.",
      },
    ],
    researchPrompts: [
      "Collect one location phrase with v or na.",
      "Find a sentence using o for its topic.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "instrumental",
    name: "Instrumental",
    question: "S kým? S čím? · With whom? With what?",
    summary:
      "The instrumental marks company, tools, and other means, especially after s or so.",
    body: [
      "Use instrumental after s or so for the person or thing accompanying someone. It also marks the tool used to perform an action.",
      "Some roles and states use instrumental without s. Start with common phrases, then notice the endings in context.",
    ],
    examples: [
      {
        slovak: "Idem s priateľom.",
        english: "I am going with a friend.",
        note: "s priateľom marks company.",
      },
      {
        slovak: "Píšem perom.",
        english: "I write with a pen.",
        note: "perom identifies the tool.",
      },
    ],
    researchPrompts: [
      "Find a phrase with s or so plus a person.",
      "Name one tool you use with instrumental.",
    ],
    status: "ready",
    source: languageSource,
  },
];

export const caseTopicBySlug = new Map(caseTopics.map((topic) => [topic.slug, topic]));
