/** This module holds the classes for managing events in BIDS datasets.
 * @module parser/eventManager
 */
import { generateIssue } from '../issues/issues'
import { BidsHedIssue } from '../bids/types/issues.js'

export class Event {
  /**
   * The name of the definition.
   * @type {number}
   */
  onset

  /**
   * The parsed HED group representing the definition.
   * @type {string}
   */
  defName

  /**
   * The short name of the tag representing this event ("Onset", "Inset", or "Offset").
   * @type {string}
   */
  type

  /**
   * The parsed HED group representing the definition
   * @type {ParsedHedGroup}
   */
  group

  /**
   * The tsv element source of this event.
   * @type {BidsTsvElement}
   */
  element

  constructor(defName, eventType, onset, group, element) {
    this.defName = defName
    this.type = eventType
    this.onset = onset
    this.group = group
    this.file = element.file
    this.tsvLine = element.tsvLine
  }

  /**
   * Create an event from a ParsedHedGroup.
   * @param {ParsedHedGroup} group - A group to extract an event from a temporal group, if it is a group.
   * @param {BidsTsvElement} element - The element in which this group appears.
   * @returns {Array} - Returns [Event, BidsHedIssue[]] representing the extracted event and issues.
   */
  static createEvent(group, element) {
    if (group.requiresDefTag.length === 0 && !group.reservedTags.has('Delay')) {
      return [null, []]
    }
    let onset = Number(element.onset)
    if (!Number.isFinite(onset)) {
      return [
        null,
        [
          BidsHedIssue.fromHedIssue(
            generateIssue('temporalTagInNonTemporalContext', { string: element.hedString }),
            element.file,
            { tsvLine: element.tsvLine },
          ),
        ],
      ]
    }
    if (group.requiresDefTag.length === 0) {
      return [null, []]
    }
    onset = onset + Event.extractDelay(group)
    const eventType = group.requiresDefTag[0].schemaTag.name
    let defName = null
    if (group.defTags.length === 1) {
      defName = group.defTags[0]._remainder.toLowerCase()
    } else if (group.defExpandChildren.length === 1) {
      defName = group.defExpandChildren[0].topTags[0]._remainder.toLowerCase()
    } else {
      return [
        null,
        [
          BidsHedIssue.fromHedIssue(
            generateIssue('temporalWithWrongNumberDefs', { tagGroup: group.originalTag, tag: eventType }),
            element.file,
            { tsvLine: element.tsvLine },
          ),
        ],
      ]
    }
    const event = new Event(defName, eventType, onset, group, element)
    return [event, []]
  }

  static extractDelay(group) {
    if (!group.reservedTags.has('Delay')) {
      return 0
    }
    const tags = group.reservedTags.get('Delay')
    const delay = Number(tags[0]._value)
    return Number.isFinite(delay) ? delay : 0
  }
}

export class EventManager {
  static TOLERANCE = 1e-7
  constructor() {}

  /**
   * Create a list of temporal events from BIDS elements.
   * @param {BidsTsvElement[]} elements - The elements representing the contents of a tsv file.
   * @returns {Array} - Returns [Event[], BidsHedIssue[]], the parsed event and any issues.
   */
  parseEvents(elements) {
    const eventList = []
    for (const element of elements) {
      if (!element.parsedHedString) {
        continue
      }

      for (const group of element.parsedHedString.tagGroups) {
        const [event, eventIssues] = Event.createEvent(group, element)
        if (eventIssues.length > 0) {
          return [null, eventIssues]
        }
        if (event) {
          eventList.push(event)
        }
      }
    }
    eventList.sort((a, b) => a.onset - b.onset)
    return [eventList, []]
  }

  validate(eventList) {
    const currentMap = new Map()
    for (const event of eventList) {
      if (!currentMap.has(event.defName)) {
        if (event.type === 'Offset' || event.type === 'Inset') {
          return [
            BidsHedIssue.fromHedIssue(
              generateIssue('inactiveOnset', { tag: event.type, definition: event.defName }),
              event.file,
              { tsvLine: event.tsvLine },
            ),
          ]
        }
        currentMap.set(event.defName, event)
        continue
      }
      const issues = this._resolveConflicts(currentMap, event)
      if (issues.length > 0) {
        return issues
      }
    }
    return []
  }

  _resolveConflicts(currentMap, event) {
    const currentEvent = currentMap.get(event.defName)
    // Make sure that these events are not at the same time
    if (Math.abs(currentEvent.onset - event.onset) < EventManager.TOLERANCE) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('simultaneousDuplicateEvents', {
            tagGroup1: event.group.originalTag,
            onset1: event.onset.toString(),
            tsvLine1: event.tsvLine,
            tagGroup2: currentEvent.group.originalTag,
            onset2: currentEvent.onset.toString(),
            tsvLine2: currentEvent.tsvLine,
          }),
          event.file,
        ),
      ]
    }

    if (event.type === 'Onset') {
      currentMap.set(event.defName, event)
    } else if (event.type === 'Inset' && currentEvent.type !== 'Offset') {
      currentMap.set(event.defName, event)
    } else if (event.type === 'Offset' && currentEvent.type !== 'Offset') {
      currentMap.set(event.defName, event)
    }

    return []
  }
}
