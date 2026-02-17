import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { PollForm } from '../components/PollForm';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { createPoll } from '../utils/api';

export const CreatePoll: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreatePoll = async (question: string, options: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const poll = await createPoll({ question, options });
      const link = `${window.location.origin}/poll/${poll.id}`;
      setShareLink(link);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCreateAnother = () => {
    setShareLink(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header with icon */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg mb-4 animate-bounce-slow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Create a Poll
          </h1>
          <p className="text-gray-200 text-lg font-medium">
            ✨ Create engaging polls and share instantly with anyone
          </p>
        </div>

        <Card variant="glass">
          {!shareLink ? (
            <>
              {error && (
                <div className="mb-6">
                  <ErrorMessage message={error} onRetry={() => setError(null)} />
                </div>
              )}
              <PollForm onSubmit={handleCreatePoll} isLoading={isLoading} />
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <svg
                    className="h-24 w-24 text-green-500 relative animate-scale-in"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                  Poll Created Successfully! 🎉
                </h2>
                <p className="text-gray-200 text-lg">
                  Share this link with anyone to collect votes
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 rounded-xl p-5 border-2 border-purple-500">
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  📎 Your Shareable Link
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-800 text-white border-2 border-purple-500 rounded-lg text-sm font-mono selection:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                  />
                  <Button onClick={handleCopyLink} variant="primary" className="flex items-center gap-2">
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate(`/poll/${shareLink.split('/').pop()}`)}
                  variant="primary"
                  size="lg"
                >
                  View Poll
                </Button>
                <Button
                  onClick={handleCreateAnother}
                  variant="outline"
                  size="lg"
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer with badges */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-200 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-purple-500/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="font-medium text-white">Real-time updates</span>
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-white">Anti-abuse protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
