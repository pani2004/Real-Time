// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { CreatePoll } from './pages/CreatePoll';
// import { PollView } from './pages/PollView';
// import { NotFound } from './pages/NotFound';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<CreatePoll />} />
//         <Route path="/poll/:pollId" element={<PollView />} />
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CreatePoll } from './pages/CreatePoll';
import { PollView } from './pages/PollView';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter basename="/">  {/* Add this explicitly */}
      <Routes>
        <Route path="/" element={<CreatePoll />} />
        <Route path="/poll/:pollId" element={<PollView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
