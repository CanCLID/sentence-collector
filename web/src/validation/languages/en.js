const MAX_WORDS = 14;
const NUMBERS_REGEX = /[0-9]+/;

// The following symbols are disallowed, please update here as well and not just the regex
// to make it easier to read:
// < > + * \ # @ ^ [ ] ( ) /
/* eslint-disable-next-line no-useless-escape */
const SYMBOL_REGEX = /[<>\+\*\\#@\^\[\]\(\)\/]/;
// Any words consisting of uppercase letters or uppercase letters with a period
// inbetween are considered abbreviations or acronyms.
// This currently also matches fooBAR but we most probably don't want that either
// as users wouldn't know how to pronounce the uppercase letters.
const ABBREVIATION_REGEX = /[A-Z]{2,}|[A-Z]+\.*[A-Z]+/;

export function getMaxLength() {
  return MAX_WORDS;
}

export function filterNumbers(sentence) {
  return !sentence.match(NUMBERS_REGEX);
}

export function filterAbbreviations(sentence) {
  return !sentence.match(ABBREVIATION_REGEX);
}

export function filterSymbols(sentence) {
  return !sentence.match(SYMBOL_REGEX);
}