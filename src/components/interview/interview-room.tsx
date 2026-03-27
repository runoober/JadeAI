'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useInterviewStore } from '@/stores/interview-store';
import { useInterviewChat } from '@/hooks/use-interview-chat';
import { useSettingsStore } from '@/stores/settings-store';
import { ProgressBar } from './progress-bar';
import { InterviewerBanner } from './interviewer-banner';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { useInterviewControls } from './control-bar';
import { RoundTransition } from './round-transition';
import type { InterviewerConfig } from '@/types/interview';

interface InterviewRoomProps {
  sessionId: string;
}

export function InterviewRoom({ sessionId }: InterviewRoomProps) {
  const t = useTranslations('interview.room');
  const router = useRouter();
  const { rounds, currentRoundIndex, advanceToNextRound, setIsGeneratingReport } =
    useInterviewStore();
  const [showTransition, setShowTransition] = useState(false);

  const currentRound = rounds[currentRoundIndex];
  const interviewerConfig = currentRound?.interviewerConfig as InterviewerConfig;

  const { messages, input, handleInputChange, handleSubmit, isLoading, resetMessages, sendMessage } =
    useInterviewChat({
      sessionId,
      roundId: currentRound?.id || '',
      selectedModel: useSettingsStore.getState().aiModel,
    });

  // Auto-send first message to get interviewer's opening (guard against StrictMode double-fire)
  const sentInitRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentRound && messages.length === 0 && !isLoading && sentInitRef.current !== currentRound.id) {
      sentInitRef.current = currentRound.id;
      sendMessage({ text: '你好，我准备好了，请开始面试。' });
    }
  }, [currentRound?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect round completion
  useEffect(() => {
    if (!messages.length || isLoading) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;
    const text = lastMsg.parts?.find((p: any) => p.type === 'text');
    if ((text as any)?.text?.includes('[ROUND_COMPLETE]')) {
      setShowTransition(true);
    }
  }, [messages, isLoading]);

  const handleNextRound = useCallback(() => {
    setShowTransition(false);
    advanceToNextRound();
    resetMessages();
  }, [advanceToNextRound, resetMessages]);

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    router.push(`/interview/${sessionId}/report`);
  }, [sessionId, router, setIsGeneratingReport]);

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  // Trigger AI after control actions (skip/hint/end-round)
  const handleTriggerAI = useCallback((text: string) => {
    sendMessage({ text });
  }, [sendMessage]);

  // Hook must be called unconditionally before any early returns
  const controls = useInterviewControls({
    sessionId,
    roundId: currentRound?.id ?? '',
    lastAssistantMessageId: lastAssistantMsg?.id,
    isLoading,
    onTriggerAI: handleTriggerAI,
  });

  if (!currentRound) return null;

  const isLastRound = currentRoundIndex >= rounds.length - 1;

  if (showTransition) {
    const nextRound = rounds[currentRoundIndex + 1];
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <ProgressBar />
        <RoundTransition
          nextInterviewer={(nextRound?.interviewerConfig as InterviewerConfig) || interviewerConfig}
          onContinue={isLastRound ? handleGenerateReport : handleNextRound}
          isLastRound={isLastRound}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3" style={{ height: 'calc(100vh - 180px)' }}>
      <ProgressBar />
      <InterviewerBanner config={interviewerConfig} />
      <MessageList messages={messages} interviewerConfig={interviewerConfig} />
      {isLoading && (
        <p className="px-4 text-sm text-zinc-400">{t('generating')}</p>
      )}
      <div className="space-y-2 border-t border-zinc-100 pt-2 pb-2 dark:border-zinc-800">
        {controls}
        <MessageInput
          input={input}
          isLoading={isLoading}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
