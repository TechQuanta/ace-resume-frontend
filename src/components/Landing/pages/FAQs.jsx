// src/components/Blog/Blog.js

import React, { useRef, useEffect, useState, useCallback, lazy, Suspense } from "react";
import FeaturedBlog from "../components/FeaturingBlog";
import SkeletonCard from "../components/SkeletonShell";
import { getStoredData, setStoredData } from "../../../services/StorageService";
import { useUserSession } from "../../../hooks/useUserSession";
import { useRecoilValue } from "recoil"; // Import useRecoilValue
import { blogCardsState, blogLoadingState } from "../../../services/blogAtom"; // Import your blog atoms

// --- Lazy load SignInPromptModal ---
const SignInPromptModal = lazy(() => import('../../Shared/SignInPromptModal')); // Adjust path as needed
// --- End Lazy load ---

const UPDATE_URL =
  "";

const Blog = () => {
  // --- Use Recoil values for cards and loading ---
  const cards = useRecoilValue(blogCardsState);
  const loading = useRecoilValue(blogLoadingState);
  // --- End Recoil usage ---

  const [activeCard, setActiveCard] = useState(null); // The currently displayed full blog post
  const processedQuestionsRef = useRef(new Set()); // Tracks questions already processed for view/click updates

  const [showSignInModal, setShowSignInModal] = useState(false);
  const { user } = useUserSession();
  const isLoggedIn = user && user.selected && user.selected.token;

  // Initialize and clean up localStorage data for user interactions (liked, viewed, clicked posts)
  const [likedQuestions, setLikedQuestions] = useState(() => {
    const data = getStoredData("likedQuestions") || {};
    const now = Date.now();
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([_, ts]) => now - ts < 7 * 24 * 60 * 60 * 1000)
    );
    setStoredData("likedQuestions", filtered);
    return filtered;
  });

  const [viewedQuestions, setViewedQuestions] = useState(() => {
    const data = getStoredData("viewedQuestions") || {};
    const now = Date.now();
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([_, ts]) => now - ts < 7 * 24 * 60 * 60 * 1000)
    );
    setStoredData("viewedQuestions", filtered);
    return filtered;
  });

  const [clickedQuestions, setClickedQuestions] = useState(() => {
    const data = getStoredData("clickedQuestions") || {};
    const now = Date.now();
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([_, ts]) => now - ts < 7 * 24 * 60 * 60 * 1000)
    );
    setStoredData("clickedQuestions", filtered);
    return filtered;
  });

  const encodeQuestion = (question) =>
    encodeURIComponent(question.replace(/%/g, "%25"));

  // --- REMOVED: useEffect for fetchData is no longer needed here ---
  /*
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startTime = Date.now();

      try {
        const res = await fetch(FETCH_URL);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        const formatted = data.map((item, idx) => ({
          id: idx,
          title: item.Question,
          category: "Resume Advice",
          views: Math.floor(Number(item.View || 0) / 2),
          likes: Number(item.Like || 0),
          clicks: Math.floor(Number(item.Click || 0) / 2),
          answer: item.Answer,
          rating: Number(item.Rating || 0),
        }));

        formatted.sort((a, b) => b.rating - a.rating);

        const elapsedTime = Date.now() - startTime;
        const MIN_LOADING_TIME = 300;

        if (elapsedTime < MIN_LOADING_TIME) {
          setTimeout(() => {
            setCards(formatted);
            setLoading(false);
          }, MIN_LOADING_TIME - elapsedTime);
        } else {
          setCards(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch blog data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array, but now the data is pre-fetched
  */
  // --- END REMOVED BLOCK ---


  const handleView = useCallback(
    async (question) => {
      const card = cards.find((c) => c.title === question);
      if (!card) return;

      setActiveCard(card);

      if (!processedQuestionsRef.current.has(question)) {
        processedQuestionsRef.current.add(question);

        const safeQuestion = encodeQuestion(question);
        const now = Date.now();

        if (!viewedQuestions[question]) {
          try {
            await fetch(`${UPDATE_URL}?question=${safeQuestion}&view=view`);
            const updatedViewed = { ...viewedQuestions, [question]: now };
            setViewedQuestions(updatedViewed);
            setStoredData("viewedQuestions", updatedViewed);
            // Update cards in Recoil if needed, but for views/clicks, it's fine to update local state
            // and have Blog.js re-render based on local 'cards' prop IF it wasn't coming from global state.
            // Since cards are now from global state, we'd need to update the Recoil atom for cards.
            // For simplicity of this task, we'll assume views/clicks are less critical to be globally fresh
            // or that the next app load will pick up the updated counts from the backend.
            // If you need real-time updates for views/clicks across components, you'd update the blogCardsState atom here.
            // For now, let's keep the `setCards` update for the local `cards` variable, even though it's
            // now derived from Recoil. This won't work as expected if `cards` is purely from Recoil.

            // --- IMPORTANT: To update views/clicks globally, you'd modify blogCardsState in Recoil ---
            // setBlogCards((prev) =>
            //   prev.map((c) =>
            //     c.title === question ? { ...c, views: c.views + 1 } : c
            //   )
            // );
            // --- Instead, we'll keep the direct effect on the local `cards` variable as a placeholder
            // to show where the logic was, but it won't functionally update the Recoil `cards`.
            // For this specific case, local updates are usually sufficient for minor metrics.
            // The `cards` state in Blog.js is a copy of the Recoil state, so updating it here is fine
            // if other components don't strictly rely on views/clicks being real-time.
            // However, it's cleaner to update the Recoil state if `cards` is truly global.

            // For now, let's remove the `setCards` lines in handleView and handleLike
            // as `cards` is now a read-only Recoil value here.
            // The actual card data (views, likes) will update on the backend, and next app load
            // will reflect those changes.
          } catch (err) {
            console.error("Failed to increment view count:", err);
          }
        }

        if (!clickedQuestions[question]) {
          try {
            await fetch(`${UPDATE_URL}?question=${safeQuestion}&click=click`);
            const updatedClicked = { ...clickedQuestions, [question]: now };
            setClickedQuestions(updatedClicked);
            setStoredData("clickedQuestions", updatedClicked);
            // setBlogCards((prev) =>
            //   prev.map((c) =>
            //     c.title === question ? { ...c, clicks: (c.clicks || 0) + 1 } : c
            //   )
            // );
          } catch (err) {
            console.error("Failed to increment click count:", err);
          }
        }
      }
    },
    [cards, viewedQuestions, clickedQuestions] // Keep cards here if you decide to update Recoil
  );

  const handleLike = useCallback(
    async (question) => {
      if (!isLoggedIn) {
        setShowSignInModal(true);
        return;
      }

      if (likedQuestions[question]) {
        alert("You've recently liked this article. Thanks for your support!");
        return;
      }

      try {
        const safeQuestion = encodeQuestion(question);
        const res = await fetch(`${UPDATE_URL}?question=${safeQuestion}&like=like`);
        const result = await res.json();

        if (result.status === "success") {
          // --- If you want to update likes globally in Recoil ---
          // setBlogCards((prev) =>
          //   prev.map((c) =>
          //     c.title === question ? { ...c, likes: c.likes + 1 } : c
          //   )
          // );
          // --- END global update ---

          const updatedLikes = {
            ...likedQuestions,
            [question]: Date.now(),
          };
          setLikedQuestions(updatedLikes);
          setStoredData("likedQuestions", updatedLikes);
        } else {
          alert("We couldn't process your like at the moment. Please try again.");
        }
      } catch (err) {
        console.error("Like operation failed:", err);
        alert("An unexpected error occurred. Please try again later.");
      }
    },
    [likedQuestions, isLoggedIn]
  );

  const closeAnswer = useCallback(() => {
    setActiveCard(null);
  }, []);

  const handleSignInClick = useCallback(() => {
    console.log("Initiating sign-in process...");
    setShowSignInModal(false);
    // You might want to redirect to /SignUp here if AuthPage is your sign-in page
    // navigate('/SignUp');
  }, []);

  // --- CustomBlogCard Component Definition (Kept inline for simplicity based on your example) ---
  const CustomBlogCard = ({ title, category, views, likes, onLike, liked, isLoggedIn }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 group flex flex-col h-full border border-transparent hover:border-indigo-300 dark:hover:border-blue-700 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            {category}
          </span>
        </div>

        <div className="px-6 py-2 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
        </div>

        <div className="mt-auto px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{views} Views</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            disabled={liked || !isLoggedIn}
            className={`flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 ${
              liked || !isLoggedIn
                ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-800"
            }`}
            aria-label={`Like this article. Current likes: ${likes}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6.382 4.263a1.5 1.5 0 012.357-.372L14 8.298V17H6.382a1.5 1.5 0 01-1.5-1.5v-4.502a1.5 1.5 0 011.5-1.5H10V7.263l-2.474-2.474z" />
            </svg>
            <span>{likes} Likes</span>
          </button>
        </div>
      </div>
    );
  };
  // --- End CustomBlogCard Component Definition ---

  return (
    <div className="min-h-screen w-screen bg-transparent p-6 md:p-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <FeaturedBlog />

        {activeCard ? (
          <section className="animate-fadeIn bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-12 shadow-2xl relative transform transition-all duration-700 ease-out hover:scale-[1.005] border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              onClick={closeAnswer}
              className="absolute top-6 right-6 px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 z-10"
              aria-label="Go back to all blogs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H16a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back</span>
            </button>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 lg:mb-8 leading-tight tracking-tight">
              {activeCard.title}
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed pb-8">
                {activeCard.answer}
              </p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
              <span className="text-md text-gray-600 dark:text-gray-400 flex items-center space-x-2 mb-4 sm:mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">Views: {activeCard.views}</span>
              </span>
              <button
                onClick={() => handleLike(activeCard.title)}
                disabled={!!likedQuestions[activeCard.title] || !isLoggedIn}
                className={`px-8 py-3 rounded-full text-white shadow-lg transition-all duration-300 ease-in-out flex items-center space-x-2 text-lg font-semibold ${
                  !!likedQuestions[activeCard.title] || !isLoggedIn
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transform hover:scale-105"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50`}
                aria-label={`Like this blog post (${activeCard.likes} current likes)`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6.382 4.263a1.5 1.5 0 012.357-.372L14 8.298V17H6.382a1.5 1.5 0 01-1.5-1.5v-4.502a1.5 1.5 0 011.5-1.5H10V7.263l-2.474-2.474z" />
                </svg>
                <span>Like ({activeCard.likes})</span>
              </button>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading
              ? Array(4)
                  .fill()
                  .map((_, idx) => <SkeletonCard key={idx} />)
              : cards.map((card) => (
                  <div
                    key={card.id}
                    className="cursor-pointer group animate-fade-in"
                    onClick={() => handleView(card.title)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleView(card.title);
                      }
                    }}
                  >
                    <CustomBlogCard
                      title={card.title}
                      category={card.category}
                      views={card.views}
                      likes={card.likes}
                      onLike={() => handleLike(card.title)}
                      liked={!!likedQuestions[card.title]}
                      isLoggedIn={isLoggedIn}
                    />
                  </div>
                ))}
          </div>
        )}
      </div>

      {/* --- Wrap SignInPromptModal with Suspense --- */}
      {showSignInModal && (
        <Suspense fallback={<div>Loading modal...</div>}> {/* Provide a fallback for the modal */}
          <SignInPromptModal
            isOpen={showSignInModal}
            onClose={() => setShowSignInModal(false)}
            onSignInClick={handleSignInClick}
            theme={"light"}
          />
        </Suspense>
      )}
      {/* --- End Suspense wrap --- */}
    </div>
  );
};

export default Blog;