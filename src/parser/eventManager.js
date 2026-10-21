/**
 * This module holds the classes for managing events in BIDS datasets.
 * @module parser/eventManager
 */

import { BidsHedIssue } from '../bids/types/issues'
import { generateIssue, IssueError } from '../issues/issues'

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
   * The parsed HED group representing the definition.
   * @type {ParsedHedGroup}
   */
  group

  /**
   * The file this element belongs to (usually just the path).
   * @type {object}
   */
  file

  /**
   * The line number(s) (including the header) represented by this element.
   * @type {string}
   */
  tsvLine

  /**
   * Constructor. Use {@link Event.createEvent} instead.
   *
   * @param {string} defName - The name of the definition.
   * @param {string} eventType - The short name of the tag representing this event.
   * @param {number} onset - The onset of the event.
   * @param {ParsedHedGroup} group - The group representing this event.
   * @param {BidsTsvElement} element - The element in which this group appears.
   * @private
   */
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
   *
   * @param {ParsedHedGroup} group - A group to extract an event from a temporal group, if it is a group.
   * @param {BidsTsvElement} element - The element in which this group appears.
   * @returns {Array} A tuple [Event|null, BidsHedIssue[]] representing the extracted event and issues.
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
      defName = group.defTags[0].remainder.toLowerCase()
    } else if (group.defExpandChildren.length === 1) {
      defName = group.defExpandChildren[0].topTags[0].remainder.toLowerCase()
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

  /**
   * Extract the delay of a temporal group.
   *
   * @param {ParsedHedGroup} group - The group.
   * @returns {number} The delay in seconds, or 0 if the group has no convertible Delay.
   * @private
   */
  static extractDelay(group) {
    const tags = group.reservedTags.get('Delay')
    if (tags === undefined) {
      return 0
    }
    // The delay is converted to the default unit of its unit class (seconds). A delay that cannot be
    // converted is reported by the TSV validator before events are created; here it counts as 0.
    return tags[0].valueAsDefaultUnit() ?? 0
  }
}

export class EventManager {
  static TOLERANCE = 1e-7

  /**
   * Create a list of temporal events from BIDS elements.
   *
   * @param {BidsTsvElement[]} elements - The elements representing the contents of a tsv file.
   * @returns {Array} A tuple [Event[], BidsHedIssue[]] with the parsed event and any issues.
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
          return [[], eventIssues]
        }
        if (event) {
          eventList.push(event)
        }
      }
    }
    eventList.sort((a, b) => a.onset - b.onset)
    return [eventList, []]
  }

  /**
   * Validate a list of temporal events.
   *
   * @param {Event[]} eventList - The events, sorted by onset.
   * @returns {BidsHedIssue[]} Any issues found.
   */
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

  /**
   * Resolve an event against the current event for its definition.
   *
   * @param {Map<string, Event>} currentMap - The current event for each definition.
   * @param {Event} event - The new event.
   * @returns {BidsHedIssue[]} Any issues found.
   * @private
   */
  _resolveConflicts(currentMap, event) {
    const currentEvent = currentMap.get(event.defName)
    if (currentEvent === undefined) {
      IssueError.generateAndThrowInternalError('currentMap is resolving a conflict with an undefined event')
    }
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
