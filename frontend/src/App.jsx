import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};
function App() {
  const user = useRecoilValue(userAtom);
  const location = useLocation();
  const { pathname } = location;

  return (
    <Box position={"relative"} w='full'>
      <Container maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}>
        <Header />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Routes location={location}>
              <Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
              <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
              <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />

              <Route
                path='/:username'
                element={
                  user ? (
                    <>
                      <CreatePost />
                      <UserPage />
                    </>
                  ) : (
                    <UserPage />
                  )
                }
              />
              <Route path='/:username/post/:pid' element={<PostPage />} />
              <Route path='/chat' element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
              <Route path='/settings' element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

export default App;