import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import PropTypes from "prop-types";

const Post = ({ post, postedBy }) => {
    const [user, setUser] = useState(null);
    const showToast = useShowToast();
    const currentUser = useRecoilValue(userAtom);
    const [posts, setPosts] = useRecoilState(postsAtom);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch("/api/users/profile/" + postedBy);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setUser(data);
            } catch (error) {
                showToast("Error", error.message, "error");
                setUser(null);
            }
        };

        getUser();
    }, [postedBy, showToast]);

    const handleDeletePost = async (e) => {
        try {
            e.preventDefault();
            if (!window.confirm("Are you sure you want to delete this post?")) return;

            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", "Post deleted", "success");
            setPosts(posts.filter((p) => p._id !== post._id));
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    }; if (!user) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                staggerChildren: 0.1
            }}
            whileHover={{
                y: -2,
                transition: { duration: 0.2 }
            }}
        >
            <Link to={`/${user.username}/post/${post._id}`}>
                <Box
                    borderRadius="xl"
                    p={4}
                    bg="transparent"
                    _hover={{
                        bg: "rgba(0,0,0,0.02)",
                        transform: "translateY(-1px)",
                        boxShadow: "sm"
                    }}
                    transition="all 0.2s ease"
                >
                    <Flex gap={3} mb={4} py={1}>
                        <Flex flexDirection={"column"} alignItems={"center"}>
                            <Avatar
                                size='md'
                                name={user.name}
                                src={user?.profilePic}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/${user.username}`);
                                }}
                            />
                            <Box w='1px' h={"full"} bg='gray.light' my={2}></Box>
                            <Box position={"relative"} w={"full"}>
                                {post.replies.length === 0 && <Text textAlign={"center"}>🥱</Text>}
                                {post.replies[0] && (
                                    <Avatar
                                        size='xs'
                                        name='John doe'
                                        src={post.replies[0].userProfilePic}
                                        position={"absolute"}
                                        top={"0px"}
                                        left='15px'
                                        padding={"2px"}
                                    />
                                )}

                                {post.replies[1] && (
                                    <Avatar
                                        size='xs'
                                        name='John doe'
                                        src={post.replies[1].userProfilePic}
                                        position={"absolute"}
                                        bottom={"0px"}
                                        right='-5px'
                                        padding={"2px"}
                                    />
                                )}

                                {post.replies[2] && (
                                    <Avatar
                                        size='xs'
                                        name='John doe'
                                        src={post.replies[2].userProfilePic}
                                        position={"absolute"}
                                        bottom={"0px"}
                                        left='4px'
                                        padding={"2px"}
                                    />
                                )}
                            </Box>
                        </Flex>
                        <Flex flex={1} flexDirection={"column"} gap={2}>
                            <Flex justifyContent={"space-between"} w={"full"}>
                                <Flex w={"full"} alignItems={"center"}>
                                    <Text
                                        fontSize={"sm"}
                                        fontWeight={"bold"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(`/${user.username}`);
                                        }}
                                    >
                                        {user?.username}
                                    </Text>
                                    <Image src='/verified.png' w={4} h={4} ml={1} />
                                </Flex>
                                <Flex gap={4} alignItems={"center"}>
                                    <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>
                                        {formatDistanceToNow(new Date(post.createdAt))} ago
                                    </Text>

                                    {currentUser?._id === user._id && <DeleteIcon size={20} onClick={handleDeletePost} />}
                                </Flex>
                            </Flex>

                            <Text fontSize={"sm"}>{post.text}</Text>
                            {post.img && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
                                        <Image src={post.img} w={"full"} />
                                    </Box>
                                </motion.div>
                            )}

                            {/* Added display for likes and replies numbers */}
                            <Flex gap={2} alignItems={"center"}>
                                <Text color={"gray.light"} fontSize='sm'>
                                    {post.replies.length} replies
                                </Text>
                                <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
                                <Text color={"gray.light"} fontSize='sm'>
                                    {post.likes.length} likes
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </Box>
            </Link>
        </motion.div>
    );
};

Post.propTypes = {
    post: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        img: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
        replies: PropTypes.arrayOf(
            PropTypes.shape({
                userProfilePic: PropTypes.string,
            })
        ).isRequired,
        likes: PropTypes.arrayOf(PropTypes.string).isRequired, // Added validation for likes
    }).isRequired,
    postedBy: PropTypes.string.isRequired,
};

export default Post;