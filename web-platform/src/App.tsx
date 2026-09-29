import { Component, Suspense, lazy, type ReactNode } from "react";
import { Loading } from "./components/Common";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { CharactersPage, CharacterDetailPage } from "./pages/CharactersPage";
const CharacterChatPage = lazy(() =>
  import("./pages/CharacterChatPage").then((module) => ({
    default: module.CharacterChatPage,
  })),
);
const InteractiveStoryPage = lazy(() =>
  import("./pages/InteractiveStoryPage").then((module) => ({
    default: module.InteractiveStoryPage,
  })),
);
const StoryGeneratorPage = lazy(() =>
  import("./pages/StoryGeneratorPage").then((module) => ({
    default: module.StoryGeneratorPage,
  })),
);
const StoryResultPage = lazy(() =>
  import("./pages/StoryResultPage").then((module) => ({
    default: module.StoryResultPage,
  })),
);
const QuizPage = lazy(() =>
  import("./pages/QuizPage").then((module) => ({ default: module.QuizPage })),
);
const LibraryPage = lazy(() =>
  import("./pages/LibraryPage").then((module) => ({
    default: module.LibraryPage,
  })),
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })),
);
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h1>Сиқырлы парақ ашылмай тұр</h1>
        <p>Деректеріңді өшірмей, бетті қайта ашып көр.</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Қайта көру
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Views() {
  const location = useLocation();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="characters/:id" element={<CharacterDetailPage />} />
        <Route
          path="chat/:id"
          element={<CharacterChatPage key={location.pathname} />}
        />
        <Route
          path="story"
          element={<InteractiveStoryPage key={location.pathname} />}
        />
        <Route
          path="story/:id"
          element={<InteractiveStoryPage key={location.pathname} />}
        />
        <Route path="create" element={<StoryGeneratorPage />} />
        <Route
          path="book/:id"
          element={<StoryResultPage key={location.pathname} />}
        />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="*"
          element={
            <div className="empty">
              <h1>Бұл жол әлі ашылмаған</h1>
              <a className="button primary" href="/">
                Басты бетке оралу
              </a>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="page container">
              <Loading text="Сиқырлы әлемнің жаңа беті ашылуда..." />
            </div>
          }
        >
          <Views />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
