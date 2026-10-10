/**
 * This module contains the templates for the issues.
 * @module issues/data
 */
import { type IssueMessageTemplateString } from '../utils/string'
export type IssueLevel = 'error' | 'warning'
type IssueType = {
  hedCode: string
  level: IssueLevel
  message: IssueMessageTemplateString
}
declare const issueData: Record<string, IssueType>
export default issueData
