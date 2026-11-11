import { useState } from 'react';
import { QuizQuestion } from '../types';
import { QUIZ_QUESTIONS } from '../data/quiz';
import {
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  X,
  ChevronRight,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInspectSite: (siteId: string) => void;
}

export function QuizModal({ isOpen, onClose, onInspectSite }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs modal-backdrop" onClick={onClose} />

      <div className="relative bg-white text-[#22201B] border border-[#E8E3D9] rounded shadow-xl max-w-xl w-full z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-[#E8E3D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#4A502C]" />
            <h3 className="font-serif font-medium text-base text-[#22201B]">
              Викторина: Древние стоянки Средней Азии
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#FAF8F5] rounded text-[#8C877D] hover:text-[#22201B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {!isFinished ? (
            <div>
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-[#5C574E] mb-2">
                <span>Вопрос {currentIndex + 1} из {QUIZ_QUESTIONS.length}</span>
                <span>Счёт: {score}</span>
              </div>
              <div className="w-full bg-[#F4F1EA] h-1 rounded overflow-hidden mb-4">
                <div
                  className="bg-[#4A502C] h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h4 className="font-serif font-medium text-base text-[#22201B] leading-snug mb-4">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-white hover:bg-[#FAF8F5] border-[#E8E3D9] text-[#22201B]';
                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-[#F4F8F4] border-[#D0E2CF] text-[#2D5A27] font-medium';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-[#FDF2F2] border-[#F2C8C8] text-[#9A2222]';
                    } else {
                      btnStyle = 'bg-[#FAF8F5] border-[#EFEBE2] text-[#8C877D] opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-2.5 rounded border text-xs sm:text-sm flex items-center justify-between transition-colors ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle className="w-4 h-4 text-[#2D5A27] shrink-0 ml-2" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-[#9A2222] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon answer */}
              {isAnswered && (
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#E8E3D9] text-xs mb-4">
                  <div className="font-medium text-[#22201B] mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#736E64]" />
                    <span>Пояснение:</span>
                  </div>
                  <p className="text-[#5C574E] leading-relaxed mb-2">
                    {currentQ.explanation}
                  </p>
                  {currentQ.siteIdHint && (
                    <button
                      onClick={() => {
                        onInspectSite(currentQ.siteIdHint!);
                        onClose();
                      }}
                      className="text-[11px] text-[#4A502C] hover:underline flex items-center gap-1 font-medium"
                    >
                      <BookOpen className="w-3 h-3" />
                      Открыть карточку памятника в атласе
                    </button>
                  )}
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-4 py-1.5 bg-[#4A502C] hover:bg-[#3D4224] text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <span>{currentIndex < QUIZ_QUESTIONS.length - 1 ? 'Следующий вопрос' : 'Завершить викторину'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Finished Summary Screen */
            <div className="text-center py-5 space-y-3.5">
              <div className="w-12 h-12 bg-[#F4F1EA] text-[#4A502C] rounded-full mx-auto flex items-center justify-center border border-[#E2DDD3]">
                <Award className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-serif font-medium text-xl text-[#22201B]">
                  Результат тестирования
                </h4>
                <div className="font-mono text-lg text-[#4A502C] mt-1 font-medium">
                  {score} из {QUIZ_QUESTIONS.length} баллов ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
                </div>
              </div>

              <p className="text-xs text-[#5C574E] max-w-md mx-auto leading-relaxed">
                {score >= 8
                  ? 'Превосходный академический результат! Вы отлично ориентируетесь в древнейших стоянках, археологических культурах и хронологии Средней Азии.'
                  : score >= 5
                  ? 'Хороший уровень знаний. Изучите подробнее карточки памятников и хронологическую шкалу, чтобы освежить детали раскопок.'
                  : 'Рекомендуем ознакомиться со схемами стоянок и глоссарием проекта перед повторной попыткой.'}
              </p>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={handleRestart}
                  className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D9] rounded text-xs text-[#22201B] flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-[#736E64]" />
                  Пройти заново
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-[#4A502C] hover:bg-[#3D4224] text-white rounded text-xs font-medium transition-colors"
                >
                  Вернуться к схемам
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
