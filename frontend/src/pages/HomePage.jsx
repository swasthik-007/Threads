import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import AiChatBox from "../components/AiChatBox";
import CreatePost from "../components/CreatePost";

const HomePage = () => {
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();
    useEffect(() => {
        const getFeedPosts = async () => {
            setLoading(true);
            setPosts([]);
            try {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log(data);
                setPosts(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        };
        getFeedPosts();
    }, [showToast, setPosts]); return (
        <>
            <Flex gap='10' alignItems={"flex-start"}>
                <Box flex={70}>
                    {!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}

                    {loading && (
                        <Flex justify='center'>
                            <Spinner size='xl' />
                        </Flex>
                    )}                    {posts.map((post, index) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                        >
                            <Post post={post} postedBy={post.postedBy} />
                        </motion.div>
                    ))}
                </Box>
                <Box
                    flex={30}
                    display={{
                        base: "none",
                        md: "block",
                    }}
                >
                    <SuggestedUsers />                </Box>
            </Flex>
            <CreatePost />
            <AiChatBox />
        </>
    );
};

export default HomePage;