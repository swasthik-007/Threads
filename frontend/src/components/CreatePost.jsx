import { AddIcon } from "@chakra-ui/icons";
import {
    Button,
    CloseButton,
    Flex,
    FormControl,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
    keyframes,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import MotionModalContent from './MotionModalContent';
import AnimatedFeedback from './AnimatedFeedback';
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

// Animation keyframes matching AiChatBox
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const CreatePost = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [postText, setPostText] = useState("");
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
    const imageRef = useRef(null);
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
    const user = useRecoilValue(userAtom);
    const showToast = useShowToast();
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useRecoilState(postsAtom);
    const { username } = useParams();
    const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

    const handleTextChange = (e) => {
        const inputText = e.target.value;

        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setPostText(truncatedText);
            setRemainingChar(0);
        } else {
            setPostText(inputText);
            setRemainingChar(MAX_CHAR - inputText.length);
        }
    };

    const handleCreatePost = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ postedBy: user._id, text: postText, img: imgUrl }),
            });

            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }            // Show animated feedback instead of a toast
            setShowSuccessFeedback(true);

            // Update the posts
            if (username === user.username) {
                setPosts([data, ...posts]);
            }

            onClose();
            setPostText("");
            setImgUrl("");
        } catch (error) {
            showToast("Error", error, "error");
        } finally {
            setLoading(false);
        }
    }; return (<>
        <AnimatedFeedback
            isVisible={showSuccessFeedback}
            onComplete={() => setShowSuccessFeedback(false)}
        />

        <Button
            position={"fixed"}
            bottom={90}
            right={4}
            width="70px"
            height="70px"
            bg={useColorModeValue("blue.50", "gray.800")}
            border="2px solid"
            borderColor={useColorModeValue("blue.300", "gray.600")}
            color={useColorModeValue("blue.600", "blue.400")}
            onClick={onOpen}
            borderRadius="2xl"
            boxShadow="lg"
            _hover={{
                transform: "scale(1.05)",
                boxShadow: "xl",
                bg: useColorModeValue("blue.100", "gray.700"),
                borderColor: useColorModeValue("blue.400", "blue.400"),
            }}
            _active={{
                transform: "scale(0.95)",
            }}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            animation={`${pulse} 3s ease-in-out infinite`}
            zIndex={999}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <AddIcon />
        </Button><Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay
                bg="blackAlpha.300"
                backdropFilter="blur(10px)"
            />

            <MotionModalContent
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }}
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="2xl"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
                boxShadow="2xl"
                mx={4}
            >
                <ModalHeader
                    borderBottom="1px solid"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    borderTopRadius="2xl"
                    bg={useColorModeValue("gray.50", "gray.900")}
                    fontSize="xl"
                    fontWeight="bold"
                >
                    ✨ Create New Post
                </ModalHeader>
                <ModalCloseButton
                    top="4"
                    right="4"
                    _hover={{ bg: useColorModeValue("gray.200", "gray.700") }}
                    borderRadius="full"
                />

                <ModalBody p={6}>
                    <FormControl>
                        <Textarea
                            placeholder="What's on your mind? Share your thoughts..."
                            onChange={handleTextChange}
                            value={postText}
                            minHeight="120px"
                            border="2px solid"
                            borderColor={useColorModeValue("gray.200", "gray.600")}
                            borderRadius="xl"
                            bg={useColorModeValue("gray.50", "gray.900")}
                            _hover={{
                                borderColor: useColorModeValue("blue.300", "blue.500"),
                            }}
                            _focus={{
                                borderColor: useColorModeValue("blue.400", "blue.400"),
                                boxShadow: "0 0 0 1px " + useColorModeValue("blue.400", "blue.400"),
                            }}
                            fontSize="md"
                            resize="none"
                            transition="all 0.2s"
                        />

                        <Flex justify="space-between" align="center" mt={3}>
                            <Flex align="center" gap={4}>
                                <Input type='file' hidden ref={imageRef} onChange={handleImageChange} />
                                <Button
                                    variant="ghost"
                                    leftIcon={<BsFillImageFill />}
                                    onClick={() => imageRef.current.click()}
                                    size="sm"
                                    colorScheme="blue"
                                    borderRadius="lg"
                                    _hover={{
                                        bg: useColorModeValue("blue.50", "blue.900"),
                                    }}
                                >
                                    Add Image
                                </Button>
                            </Flex>                                <Text
                                fontSize='sm'
                                fontWeight='medium'
                                color={remainingChar < 50 ? "red.500" : "gray.500"}
                                bg={useColorModeValue("gray.100", "gray.700")}
                                px={3}
                                py={1}
                                borderRadius="full"
                            >
                                {remainingChar}/{MAX_CHAR}
                            </Text>
                        </Flex>
                    </FormControl>                        {imgUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Flex
                                mt={6}
                                w={"full"}
                                position={"relative"}
                                borderRadius="xl"
                                overflow="hidden"
                                border="2px solid"
                                borderColor="gray.300"
                            >
                                <Image
                                    src={imgUrl}
                                    alt='Selected image'
                                    w="full"
                                    maxH="300px"
                                    objectFit="cover"
                                />
                                <CloseButton
                                    onClick={() => {
                                        setImgUrl("");
                                    }}
                                    bg="blackAlpha.700"
                                    color="white"
                                    position={"absolute"}
                                    top={3}
                                    right={3}
                                    size="sm"
                                    borderRadius="full"
                                    _hover={{
                                        bg: "blackAlpha.800",
                                        transform: "scale(1.1)",
                                    }}
                                    transition="all 0.2s"
                                />
                            </Flex>
                        </motion.div>
                    )}
                </ModalBody>

                <ModalFooter
                    borderTop="1px solid"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    borderBottomRadius="2xl"
                    bg={useColorModeValue("gray.50", "gray.900")}
                    gap={3}
                >
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        borderRadius="lg"
                        _hover={{
                            bg: useColorModeValue("gray.200", "gray.700"),
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme='blue'
                        onClick={handleCreatePost}
                        isLoading={loading}
                        borderRadius="lg"
                        px={8}
                        _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                        isDisabled={!postText.trim() && !imgUrl}
                    >
                        {loading ? "Publishing..." : "Publish Post"}
                    </Button>                    </ModalFooter>
            </MotionModalContent>
        </Modal>
    </>
    );
};

export default CreatePost;