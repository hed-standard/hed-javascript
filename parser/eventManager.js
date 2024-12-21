import { generateIssue, IssueError } from '../common/issues/issues'
import { parseHedString } from './parser'
//import { filterNonEqualDuplicates } from './parseUtils'
import { filterByTagName } from './parseUtils'
import { BidsHedIssue } from '../bids'

export class Event {
  /**
   * The name of the definition.
   * @type {number}
   */
  onset

  /**
   * The name of the definition.
   * @type {number}
   */
  endTime

  /**
   * The parsed HED group representing the definition
   * @type {string}
   */
  defName

  type
  group
  element

  /**
   * The parsed HED group representing the definition
   * @type {ParsedHedGroup}
   */

  constructor(defName, eventType, onset, group, element) {
    this.defName = defName
    this.type = eventType
    this.onset = onset
    this.group = group
    this.element = element
  }

  /**
   * Create an event from a ParsedHedGroup.
   * @param {ParsedHedGroup} group - A group to extract an event from a temporal group, if it is a group.
   * @param {BidsTsvElement} element - The element in which this group appears.
   * @returns {[Event, BidsHedIssue[]]} - The event extracted from the group
   */
  static createEvent(group, element) {
    if (!group.requiresDefTag) {
      return [null, []]
    }
    const onset = Number(element.onset)
    if (!Number.isFinite(onset)) {
      return [
        null,
        [
          BidsHedIssue.fromHedIssue(
            generateIssue('temporalTagInNonTemporalContext', { string: element.hedString }),
            element.tsvFile,
            { tsvLine: element.tsvLine },
          ),
        ],
      ]
    }
    const eventType = group.requiresDefTag.schemaTag.name
    let defName = null
    const defTags = group.defTags
    if (defTags.length === 1) {
      defName = defTags[0].normalized
    } else {
      return [
        null,
        [
          BidsHedIssue.fromHedIssue(
            generateIssue('temporalWithWrongNumberDefs', { tagGroup: group.originalTag, tag: eventType }),
            element.tsvFile,
            { tsvLine: element.tsvLine },
          ),
        ],
      ]
    }
    const event = new Event(defName, eventType, onset, group, element)
    return [event, []]
  }
}

export class EventManager {
  static TOLERANCE = 10 - 7
  constructor() {}

  /**
   * Create a list of temporal events from BIDS elements.
   * @param {BidsTsvElement[]} elements - The elements representing the contents of a tsv file.
   * @returns {[Event[], BidsHedIssue[]]}
   */
  parseEvents(elements) {
    const eventList = []
    const issues = []
    for (const element of elements) {
      if (!element.parsedHedString) {
        continue
      }
      for (const group of element.parsedHedString.tagGroups) {
        const [event, eventIssues] = Event.createEvent(group, element)
        if (event) {
          eventList.push(event)
        }
        issues.push(...eventIssues)
      }
    }
    eventList.sort((a, b) => a.onset - b.onset)
    return [eventList, issues]
  }

  validate(eventList) {
    const currentMap = new Map()
    for (const event of eventList) {
      if (!currentMap.has(event.defName)) {
        if (event.type === 'Offset' || event.type === 'Inset') {
          return [
            BidsHedIssue.fromHedIssue(
              generateIssue('inactiveOnset', { tag: event.type, definition: event.defName }),
              event.element.tsvFile,
            ),
            { tsvLine: event.element.tsvLine },
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
            tsvLine1: event.element.tsvLine.toString(),
            tagGroup2: currentEvent.group.originalTag,
            onset2: currentEvent.onset.toString(),
            tsvLine2: currentEvent.element.tsvLine.toString(),
          }),
          event.element.tsvFile,
        ),
      ]
    }

    if (event.type === 'Onset') {
      currentMap.set(event.defName, event)
    } else if (event.type === 'Inset' && currentEvent.type !== 'Offset') {
      currentMap.set(event.defName, event)
    } else if (event.type === 'Offset' && currentEvent.type !== 'Offset') {
      currentMap.set(event.defName, event)
    } else {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('simultaneousDuplicateEvents', {
            tagGroup1: event.group.originalTag,
            onset1: event.onset.toString().toString(),
            tsvLine1: event.element.tsvLine,
            tagGroup2: currentEvent.group.originalTag,
            onset2: currentEvent.onset.toString(),
            tsvLine2: currentEvent.element.tsvLine.toString(),
          }),
          event.tsvFile,
        ),
      ]
    }
    return []
  }

  /**
   * Add the non-null items to this manager
   * @param {number} onset -
   * @param {ParsedHedGroup} group - A group representing a temporal event requiring a definitions.
   */
  addEventFromGroup(onset, group) {
    if (!onset || !group.requiresDefTag) {
      return
    }
    const defName = group.requiresDefTag.normalized
  }

  /**
   * Adds the events from a hedString to
   * @param onset
   * @param {ParsedHedString} hedString -
   */
  addEventsFromParsedHed(onset, hedString) {
    for (const group of hedString.tagGroups) {
      this.addEventFromGroup(onset, group)
    }
  }
}
