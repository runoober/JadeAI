import { eq, desc, and } from 'drizzle-orm';
import { db } from '../index';
import { interviewSessions, interviewRounds, interviewMessages, interviewReports } from '../schema';
import type {
  InterviewerConfig,
  InterviewSessionStatus,
  InterviewRoundStatus,
  InterviewMessageRole,
  RoundSummary,
  DimensionScore,
  RoundEvaluation,
  ImprovementItem,
  InterviewMessageMetadata,
} from '@/types/interview';

export const interviewRepository = {
  // ── Sessions ────────────────────────────────────────────────────────────────

  async createSession(data: {
    userId: string;
    resumeId?: string | null;
    jobDescription: string;
    jobTitle: string;
    selectedInterviewers: InterviewerConfig[];
  }) {
    const id = crypto.randomUUID();
    await db.insert(interviewSessions).values({
      id,
      userId: data.userId,
      resumeId: data.resumeId ?? null,
      jobDescription: data.jobDescription,
      jobTitle: data.jobTitle,
      selectedInterviewers: data.selectedInterviewers as any,
    } as any);
    return this.findSession(id);
  },

  async findSession(sessionId: string) {
    const rows = await db.select().from(interviewSessions).where(eq(interviewSessions.id, sessionId)).limit(1);
    return rows[0] ?? null;
  },

  async findSessionsByUserId(userId: string) {
    return db.select().from(interviewSessions).where(eq(interviewSessions.userId, userId)).orderBy(desc(interviewSessions.createdAt));
  },

  async updateSessionStatus(sessionId: string, status: InterviewSessionStatus) {
    await db.update(interviewSessions).set({ status, updatedAt: new Date() }).where(eq(interviewSessions.id, sessionId));
  },

  async updateSessionRound(sessionId: string, currentRound: number) {
    await db.update(interviewSessions).set({ currentRound, updatedAt: new Date() }).where(eq(interviewSessions.id, sessionId));
  },

  async deleteSession(sessionId: string) {
    await db.delete(interviewSessions).where(eq(interviewSessions.id, sessionId));
  },

  // ── Rounds ───────────────────────────────────────────────────────────────────

  async createRound(data: {
    sessionId: string;
    interviewerType: string;
    interviewerConfig: InterviewerConfig;
    sortOrder: number;
    maxQuestions?: number;
  }) {
    const id = crypto.randomUUID();
    await db.insert(interviewRounds).values({
      id,
      sessionId: data.sessionId,
      interviewerType: data.interviewerType,
      interviewerConfig: data.interviewerConfig as any,
      sortOrder: data.sortOrder,
      maxQuestions: data.maxQuestions ?? 10,
    } as any);
    return this.findRound(id);
  },

  async findRound(roundId: string) {
    const rows = await db.select().from(interviewRounds).where(eq(interviewRounds.id, roundId)).limit(1);
    return rows[0] ?? null;
  },

  async findRoundsBySessionId(sessionId: string) {
    return db.select().from(interviewRounds).where(eq(interviewRounds.sessionId, sessionId)).orderBy(interviewRounds.sortOrder);
  },

  async updateRoundStatus(roundId: string, status: InterviewRoundStatus) {
    await db.update(interviewRounds).set({ status, updatedAt: new Date() }).where(eq(interviewRounds.id, roundId));
  },

  async incrementQuestionCount(roundId: string) {
    const rows = await db.select({ questionCount: interviewRounds.questionCount }).from(interviewRounds).where(eq(interviewRounds.id, roundId)).limit(1);
    const current = rows[0]?.questionCount ?? 0;
    await db.update(interviewRounds).set({ questionCount: current + 1, updatedAt: new Date() }).where(eq(interviewRounds.id, roundId));
  },

  async setRoundSummary(roundId: string, summary: RoundSummary) {
    await db.update(interviewRounds).set({ summary: summary as any, updatedAt: new Date() }).where(eq(interviewRounds.id, roundId));
  },

  // ── Messages ─────────────────────────────────────────────────────────────────

  async addMessage(data: {
    roundId: string;
    role: InterviewMessageRole;
    content: string;
    metadata?: InterviewMessageMetadata;
  }) {
    const id = crypto.randomUUID();
    await db.insert(interviewMessages).values({
      id,
      roundId: data.roundId,
      role: data.role,
      content: data.content,
      metadata: (data.metadata ?? {}) as any,
    } as any);
    const rows = await db.select().from(interviewMessages).where(eq(interviewMessages.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async findMessagesByRoundId(roundId: string) {
    return db.select().from(interviewMessages).where(eq(interviewMessages.roundId, roundId)).orderBy(interviewMessages.createdAt);
  },

  async findAllMessagesBySessionId(sessionId: string) {
    const rounds = await db.select({ id: interviewRounds.id }).from(interviewRounds).where(eq(interviewRounds.sessionId, sessionId)).orderBy(interviewRounds.sortOrder);
    const roundIds = rounds.map((r: { id: string }) => r.id);
    if (roundIds.length === 0) return [];
    const allMessages = await Promise.all(roundIds.map((roundId: string) => this.findMessagesByRoundId(roundId)));
    return allMessages.flat();
  },

  async updateMessageMetadata(messageId: string, metadata: InterviewMessageMetadata) {
    await db.update(interviewMessages).set({ metadata: metadata as any }).where(eq(interviewMessages.id, messageId));
  },

  // ── Reports ──────────────────────────────────────────────────────────────────

  async createReport(data: {
    sessionId: string;
    overallScore: number;
    dimensionScores: DimensionScore[];
    roundEvaluations: RoundEvaluation[];
    overallFeedback: string;
    improvementPlan: ImprovementItem[];
  }) {
    const id = crypto.randomUUID();
    await db.insert(interviewReports).values({
      id,
      sessionId: data.sessionId,
      overallScore: data.overallScore,
      dimensionScores: data.dimensionScores as any,
      roundEvaluations: data.roundEvaluations as any,
      overallFeedback: data.overallFeedback,
      improvementPlan: data.improvementPlan as any,
    } as any);
    return this.findReportBySessionId(data.sessionId);
  },

  async findReportBySessionId(sessionId: string) {
    const rows = await db.select().from(interviewReports).where(eq(interviewReports.sessionId, sessionId)).limit(1);
    return rows[0] ?? null;
  },

  async findReportsByUserId(userId: string) {
    const sessions = await db
      .select({ id: interviewSessions.id })
      .from(interviewSessions)
      .where(and(eq(interviewSessions.userId, userId), eq(interviewSessions.status, 'completed')));
    const sessionIds = sessions.map((s: { id: string }) => s.id);
    if (sessionIds.length === 0) return [];
    const reports = await Promise.all(sessionIds.map((sessionId: string) => this.findReportBySessionId(sessionId)));
    return reports.filter(Boolean);
  },
};
