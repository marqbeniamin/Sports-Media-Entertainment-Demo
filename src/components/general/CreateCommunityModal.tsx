import React, { useState, ChangeEvent, useContext } from 'react';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import { RotatingLines } from 'react-loader-spinner'; // A loader spinner for loading state

interface CreateCommunityModalProps {
  onClose: () => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ onClose }) => {
  const { createCommunity } = useContext(PubNubConext) as PubNubType;

  const [communityName, setCommunityName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [triviaQuestion, setTriviaQuestion] = useState<string>(''); // Optional trivia question
  const [triviaAnswers, setTriviaAnswers] = useState<string[]>(['', '']); // At least two answers, with the ability to add up to 3
  const [error, setError] = useState<string | null>(null); // For validation errors
  const [loading, setLoading] = useState<boolean>(false); // Loading state for community creation
  const [creationError, setCreationError] = useState<string | null>(null); // For errors during community creation

  // Handle changes for the trivia question input
  const handleTriviaQuestionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTriviaQuestion(e.target.value);
  };

  // Handle changes for trivia answers
  const handleTriviaAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...triviaAnswers];
    updatedAnswers[index] = value;
    setTriviaAnswers(updatedAnswers);
  };

  // Add an additional trivia answer (up to 3)
  const addTriviaAnswer = () => {
    if (triviaAnswers.length < 3) {
      setTriviaAnswers([...triviaAnswers, '']);
    }
  };

  // Remove an answer
  const removeTriviaAnswer = (index: number) => {
    const updatedAnswers = triviaAnswers.filter((_, i) => i !== index);
    setTriviaAnswers(updatedAnswers);
  };

  // Validate input and handle community creation
  const handleCreateCommunity = async () => {
    if (communityName.trim() === '' || description.trim() === '') {
      setError('Community name and description are required.');
      return;
    }

    if (triviaQuestion && (triviaAnswers[0].trim() === '' || triviaAnswers[1].trim() === '')) {
      setError('Trivia must have at least two answers.');
      return;
    }

    setError(null); // Clear validation errors
    setLoading(true); // Set loading state

    // Generate a unique ID for the community (for demo purposes, using a timestamp)
    const communityId = `${communityName}-${Date.now()}`;

    // If a trivia question is provided, structure the trivia data
    const trivia = triviaQuestion
      ? {
          question: triviaQuestion,
          answers: triviaAnswers.filter((answer) => answer.trim() !== ''), // Filter out empty answers
        }
      : undefined;

    // Call the createCommunity function from context
    const newCommunity = await createCommunity(communityId, communityName, description, trivia);

    if (newCommunity) {
      // console.log('Community created:', newCommunity);
      setLoading(false); // Stop loading after creation
      setCreationError(null); // Clear any previous creation errors
      onClose(); // Close the modal after creation
    } else {
      setLoading(false); // Stop loading on failure
      setCreationError('Failed to create the community. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-6 relative">
        <h2 className="text-lg text-white font-semibold mb-4">Create a New Community</h2>

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-10">
            <RotatingLines width="40" strokeColor="white" />
          </div>
        )}

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        {/* Creation Error Message */}
        {creationError && <div className="text-red-500 text-sm mb-4">{creationError}</div>}

        {/* Community Name */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Community Name</label>
          <input
            type="text"
            value={communityName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCommunityName(e.target.value)}
            className="w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter community name"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Description</label>
          <textarea
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            className="w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description"
          />
        </div>

        {/* Trivia Question (Optional) */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Trivia Question (Optional)</label>
          <input
            type="text"
            value={triviaQuestion}
            onChange={handleTriviaQuestionChange}
            className="w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a trivia question"
          />
        </div>

        {/* Trivia Answers */}
        {triviaQuestion && (
          <div className="space-y-4">
            <label className="text-gray-400 text-sm">Trivia Answers</label>
            <p className="text-xs text-gray-400">Note: The first answer will be marked as the correct one.</p>
            {triviaAnswers.map((answer, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleTriviaAnswerChange(index, e.target.value)}
                  className="flex-grow mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Answer ${index + 1}`}
                />
                {index >= 2 && (
                  <button
                    onClick={() => removeTriviaAnswer(index)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {/* Add Another Answer Button */}
            {triviaAnswers.length < 3 && (
              <button
                onClick={addTriviaAnswer}
                className="text-blue-500 hover:underline transition text-sm mt-2"
              >
                + Add another answer
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCommunity}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={loading} // Disable button when loading
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;