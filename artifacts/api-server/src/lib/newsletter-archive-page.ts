import {
  HISTORICAL_NEWSLETTER_ISSUES,
  HISTORICAL_NEWSLETTER_SUBJECTS,
} from "../data/historical-newsletter-issues.ts";

export type NewsletterArchiveCursor = {
  sentAt: Date;
  id: number;
};

export type NewsletterArchiveIssueSource = {
  id: number;
  subject: string;
  content: string;
  sentAt: Date | null;
};

export type NewsletterArchiveIssue = {
  id: number;
  subject: string;
  content: string;
  sentAt: Date;
};

const historicalSubjects = new Set(
  HISTORICAL_NEWSLETTER_SUBJECTS.map(subject => subject.trim().toLocaleLowerCase("de-DE")),
);

function isAfterCursor(issue: NewsletterArchiveIssue, cursor: NewsletterArchiveCursor) {
  const issueTime = issue.sentAt.getTime();
  const cursorTime = cursor.sentAt.getTime();
  return issueTime < cursorTime || (issueTime === cursorTime && issue.id < cursor.id);
}

export function buildNewsletterArchivePage(
  databaseIssues: readonly NewsletterArchiveIssueSource[],
  cursor: NewsletterArchiveCursor | null,
  pageSize: number,
) {
  const historicalIssues: NewsletterArchiveIssue[] = HISTORICAL_NEWSLETTER_ISSUES.map(issue => ({
    ...issue,
    sentAt: new Date(issue.sentAt),
  }));

  const publishedDatabaseIssues: NewsletterArchiveIssue[] = databaseIssues
    .filter(issue => issue.sentAt !== null)
    .filter(issue => !historicalSubjects.has(issue.subject.trim().toLocaleLowerCase("de-DE")))
    .map(issue => ({
      ...issue,
      sentAt: issue.sentAt!,
    }));

  const orderedIssues = [...historicalIssues, ...publishedDatabaseIssues]
    .filter(issue => !cursor || isAfterCursor(issue, cursor))
    .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime() || b.id - a.id);
  const hasMore = orderedIssues.length > pageSize;

  return {
    issues: orderedIssues.slice(0, pageSize),
    hasMore,
  };
}
