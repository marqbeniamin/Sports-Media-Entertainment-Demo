import React, { useState, ChangeEvent, FormEvent } from 'react';

interface TriviaQuestionProps {
  question: string;
  answers: string[];
  onCorrectAnswer: () => void;
  onIncorrectAnswer: () => void;
  ownerId: string;
  currentUserId: string;
}

const TriviaQuestion: React.FC<TriviaQuestionProps> = ({
  question,
  answers,
  onCorrectAnswer,
  onIncorrectAnswer,
  ownerId,
  currentUserId
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if the user is the owner of the community
    if (currentUserId === ownerId) {
      onCorrectAnswer(); // Auto-correct for owners
      return;
    }

    // If the selected answer is correct (the first one is correct)
    if (selectedAnswer === answers[0]) {
      setFeedback('Correct! You can now join the chat.');
      onCorrectAnswer(); // Allow access to chat
    } else {
      setFeedback('Incorrect answer. You cannot join the chat.');
      onIncorrectAnswer(); // Deny access to chat
    }
  };

  return (
    <div className="p-6 rounded-lg w-full max-w-md space-y-6 z-10 shadow-lg">
      <h2 className="text-lg text-white font-semibold mb-4">Answer the Trivia Question to Join</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-4 block">{question}</label>
          <div className="space-y-2">
            {answers.map((answer, index) => (
              <button
                type="button"
                key={index}
                onClick={() => handleAnswerChange(answer)}
                className={`w-full p-3 rounded-lg text-left bg-gray-700 text-white hover:bg-blue-600 transition-colors duration-300 ease-in-out ${
                  selectedAnswer === answer ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {answer}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`text-sm mt-4 ${
              feedback.startsWith('Correct') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={!selectedAnswer} // Disable submit button if no answer is selected
          >
            Submit Answer
          </button>
        </div>
      </form>
    </div>
  );
};

export default TriviaQuestion;