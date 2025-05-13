// app/page.tsx
'use client';

import { useState } from 'react';

type Reply = {
  id: number;
  username: string;
  text: string;
  currentLikes: number;
};

const replies: Reply[] = [
  { id: 1, username: '@alice', text: 'This is hilarious 😂', currentLikes: 32 },
  { id: 2, username: '@bob', text: 'I totally agree!', currentLikes: 27 },
  { id: 3, username: '@carla', text: 'Wrong take.', currentLikes: 15 },
];

export default function Home() {
  const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleBet = (id: number) => {
    setSelectedReplyId(id);
  };

  const handleSubmit = () => {
    if (selectedReplyId !== null) {
      setHasSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold text-center">🔮 Bet on the Best Tweet Reply</h1>
      <div className="max-w-xl w-full space-y-4">
        {replies.map((reply) => (
          <button
            key={reply.id}
            onClick={() => handleBet(reply.id)}
            className={`w-full text-left border rounded-xl p-4 transition-all ${
              selectedReplyId === reply.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-300'
            }`}
          >
            <div className="font-semibold text-sm text-gray-600 dark:text-gray-300">
              {reply.username}
            </div>
            <p className="mt-1 text-base">{reply.text}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Likes: {reply.currentLikes}
            </p>
          </button>
        ))}
      </div>

      {!hasSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedReplyId === null}
          className="mt-4 px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-90 disabled:opacity-50"
        >
          Submit Bet
        </button>
      ) : (
        <div className="mt-6 text-center text-green-600 dark:text-green-400 font-medium">
          ✅ Bet submitted for reply #{selectedReplyId}
        </div>
      )}
    </div>
  );
}
