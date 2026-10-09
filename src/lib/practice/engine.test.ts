import { describe, expect, it } from 'vitest'

import {
  answersMatch,
  findActiveCluster,
  MASTERY_THRESHOLD,
  progressAfterCorrect,
  type ClusterWithStatusNew,
  type TopicWithClustersNew,
} from './engine'

// =====================================================================
// Nakijken: wanneer telt een antwoord als goed?
// =====================================================================
describe('answersMatch', () => {
  it('rekent een exact gelijk antwoord goed', () => {
    expect(answersMatch('12x^2', '12x^2')).toBe(true)
  })

  it('negeert spaties en hoofdletters', () => {
    expect(answersMatch('  12 X^2 ', '12x^2')).toBe(true)
  })

  it('rekent een weggelaten maalteken goed', () => {
    expect(answersMatch('3*x', '3x')).toBe(true)
    expect(answersMatch('3·x', '3x')).toBe(true)
  })

  it('rekent haakjes om een simpele exponent goed', () => {
    expect(answersMatch('x^(-1)', 'x^-1')).toBe(true)
    expect(answersMatch('e^(x)', 'e^x')).toBe(true)
  })

  it('laat haakjes om een samengestelde exponent staan', () => {
    // e^(x+1) is iets anders dan e^x + 1; dat mag niet samenvallen.
    expect(answersMatch('e^(x+1)', 'e^x+1')).toBe(false)
  })

  it('rekent x^1 gelijk aan x', () => {
    expect(answersMatch('5x^1', '5x')).toBe(true)
  })

  it('rekent het lange minteken als gewoon minteken', () => {
    expect(answersMatch('3x−2', '3x-2')).toBe(true)
  })

  it('rekent +- als minteken', () => {
    expect(answersMatch('3x+-2', '3x-2')).toBe(true)
  })

  it('rekent een alternatieve schrijfwijze uit de vraag goed', () => {
    expect(answersMatch('1/(2sqrt(x))', '0.5x^(-1/2)', ['1/(2sqrt(x))'])).toBe(
      true,
    )
  })

  it('rekent een fout antwoord fout', () => {
    expect(answersMatch('2x', '3x')).toBe(false)
    expect(answersMatch('', '3x')).toBe(false)
  })
})

// =====================================================================
// Voortgang: wanneer gaat de reeks omhoog en wanneer is iets beheerst?
// =====================================================================
describe('progressAfterCorrect', () => {
  it('zet de reeks één omhoog bij een goed antwoord', () => {
    expect(progressAfterCorrect(0).correct_streak).toBe(1)
    expect(progressAfterCorrect(1).correct_streak).toBe(2)
  })

  it('is nog niet beheerst onder de drempel', () => {
    expect(progressAfterCorrect(0)).toMatchObject({
      status: 'in_progress',
      mastered: false,
    })
    expect(progressAfterCorrect(1)).toMatchObject({
      status: 'in_progress',
      mastered: false,
    })
  })

  it('is beheerst bij drie goed achter elkaar', () => {
    expect(progressAfterCorrect(MASTERY_THRESHOLD - 1)).toEqual({
      correct_streak: 3,
      status: 'mastered',
      mastered: true,
    })
  })

  it('blijft beheerst na nog een goed antwoord', () => {
    expect(progressAfterCorrect(MASTERY_THRESHOLD)).toMatchObject({
      correct_streak: 4,
      status: 'mastered',
      mastered: true,
    })
  })
})

// =====================================================================
// Welke som is nu aan de beurt?
// =====================================================================
function cluster(
  slug: string,
  status: ClusterWithStatusNew['status'],
): ClusterWithStatusNew {
  return {
    id: slug,
    slug,
    title: slug,
    topic_id: 'topic',
    order_index: 1,
    status,
    correct_streak: status === 'mastered' ? MASTERY_THRESHOLD : 0,
  }
}

function topic(
  slug: string,
  clusters: ClusterWithStatusNew[],
  isLocked = false,
): TopicWithClustersNew {
  return {
    id: slug,
    slug,
    title: slug,
    chapter_id: 'h2',
    chapter_slug: 'h2',
    chapter_title: 'Hoofdstuk 2',
    order_index: 1,
    clusters,
    isLocked,
    isMastered: clusters.every((c) => c.status === 'mastered'),
  }
}

describe('findActiveCluster', () => {
  it('kiest het eerste cluster dat nog niet beheerst is', () => {
    const path = [
      topic('basis', [
        cluster('basis-1', 'mastered'),
        cluster('basis-2', 'in_progress'),
      ]),
    ]
    expect(findActiveCluster(path)?.cluster).toMatchObject({ slug: 'basis-2' })
  })

  it('slaat een volledig beheerst onderwerp over', () => {
    const path = [
      topic('basis', [cluster('basis-1', 'mastered')]),
      topic('somregel', [cluster('somregel-1', 'locked')]),
    ]
    expect(findActiveCluster(path)?.cluster).toMatchObject({
      slug: 'somregel-1',
    })
  })

  it('geeft niets terug als het volgende onderwerp nog op slot zit', () => {
    const path = [topic('somregel', [cluster('somregel-1', 'locked')], true)]
    expect(findActiveCluster(path)).toBeNull()
  })

  it('geeft niets terug als alles beheerst is', () => {
    const path = [topic('basis', [cluster('basis-1', 'mastered')])]
    expect(findActiveCluster(path)).toBeNull()
  })
})
