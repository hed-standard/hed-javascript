import { generateIssue, IssueError } from '../common/issues/issues'
import { parseHedString } from './parser'
//import { filterNonEqualDuplicates } from './parseUtils'
import { filterByTagName } from './parseUtils'

export class Event {
  /**
   * The name of the definition.
   * @type {number}
   */
  startTime

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

  eventType

  constructor(defName, eventType, tartTime, endTime) {
    this.defGroup = defName
    this.eventType = eventType
    this.startTime = startTime
    this.endTime = endTime
  }

  /**
   * Create an event from a ParsedHedGroup
   * @param {ParsedHedGroup} group - A group to extract an event from
   * @returns {Event | null} - The event extracted from the group
   */
  static createEvent(onset, group) {
    return null
  }
}

export class EventManager {
  /** Detects appropriate nesting of events and duplicate events at the same time.
  /**
   * @type { Map<string, Event>} -definitions for this manager
   */
  events
  issues

  constructor() {
    this.events = new Map()
    this.issues = []
  }

  /**
   * Add the non-null items to this manager
   * @param {number} onset -
   * @param {ParsedHedGroup} group - A group representing a temporal event requiring a definitions.
   */
  addEventFromGroup(onset, group) {}

  /**
   * Adds the events from a hedString to
   * @param onset
   * @param hedString
   */
  addEventsFromHedString(onset, hedString) {
    for (const group of hedString.tagGroups) {
      this.addEventFromGroup(onset, group)
    }
  }
}
