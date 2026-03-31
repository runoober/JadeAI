import { z } from 'zod/v4';

const questionEvaluationSchema = z.object({
  question: z.string().describe('The interview question as asked by the interviewer'),
  answerSummary: z.string().describe('Concise summary of the candidate\'s response, capturing key points and reasoning'),
  score: z.number().min(1).max(5).describe('Question score: 1=Unable to answer, 2=Weak fundamentals, 3=Adequate, 4=Good, 5=Excellent'),
  highlights: z.array(z.string()).describe('Specific strengths demonstrated in the answer (concrete observations, not generic praise)'),
  weaknesses: z.array(z.string()).describe('Specific gaps or issues revealed in the answer (actionable observations)'),
  referenceTips: z.string().describe('Suggested answer direction, key knowledge points, or frameworks the candidate should study for improvement'),
  marked: z.boolean().describe('Whether the candidate flagged this question for later review'),
  hinted: z.boolean().describe('Whether the candidate requested a hint before answering'),
  skipped: z.boolean().describe('Whether the candidate chose to skip this question entirely'),
});

const roundEvaluationSchema = z.object({
  roundId: z.string().describe('Unique identifier for this interview round'),
  interviewerType: z.string().describe('Category of interviewer (e.g., hr, technical, scenario, behavioral, project_deep_dive, leader)'),
  interviewerName: z.string().describe('Name of the interviewer who conducted this round'),
  score: z.number().min(0).max(100).describe('Round score (0-100) reflecting the candidate\'s overall performance in this round'),
  feedback: z.string().describe('Round-level feedback summarizing the candidate\'s performance, strengths, and areas for improvement'),
  questions: z.array(questionEvaluationSchema).describe('Individual evaluations for each question asked in this round'),
});

const dimensionScoreSchema = z.object({
  dimension: z.string().describe('Competency dimension name (e.g., Technical Depth, System Design, Communication)'),
  score: z.number().min(0).max(100).describe('Candidate\'s score on this dimension based on evidence from the interview'),
  maxScore: z.number().describe('Maximum possible score for this dimension (always 100)'),
});

const improvementItemSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']).describe('Improvement priority: high=critical gap, medium=notable weakness, low=nice-to-have'),
  area: z.string().describe('The specific skill or knowledge area to improve'),
  description: z.string().describe('What to improve, why it matters for the target role, and suggested approach'),
  resources: z.array(z.string()).describe('Specific learning resources: books, online courses, documentation, open-source projects, or practice platforms'),
});

export const interviewReportSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Comprehensive interview score (0-100) reflecting overall candidate assessment across all rounds'),
  dimensionScores: z.array(dimensionScoreSchema).describe('6-8 competency dimension scores for radar chart visualization'),
  roundEvaluations: z.array(roundEvaluationSchema).describe('Detailed per-round evaluations with question-level assessments'),
  overallFeedback: z.string().describe('3-5 paragraphs of professional feedback: core strengths, key weaknesses, role-fit analysis, and hire recommendation'),
  improvementPlan: z.array(improvementItemSchema).describe('Prioritized improvement plan with actionable items and learning resources'),
});

export type InterviewReportOutput = z.infer<typeof interviewReportSchema>;
