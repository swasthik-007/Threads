import {
    Box,
    Button,
    Flex,
    Text,
    Textarea,
    VStack,
    HStack,
    Avatar,
    useColorModeValue,
    Spinner,
    Badge,
    Collapse,
    IconButton,
    keyframes,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import useShowToast from "../hooks/useShowToast";
import useAiChat from "../hooks/useAiChat";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { BsRobot, BsSend, BsTrash, BsLightning } from "react-icons/bs";

// Animation keyframes for the floating effect
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const AiChatBox = () => {
    const [prompt, setPrompt] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);
    const user = useRecoilValue(userAtom);
    const [, setPosts] = useRecoilState(postsAtom);
    const showToast = useShowToast();
    const { messages, isLoading, sendMessage, clearMessages } = useAiChat(); const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const inputBgColor = useColorModeValue("white", "gray.700");
    const inputTextColor = useColorModeValue("gray.800", "white");
    const inputPlaceholderColor = useColorModeValue("gray.500", "gray.400");
    const inputFocusBgColor = useColorModeValue("white", "gray.600");
    const charCountBgColor = useColorModeValue("white", "gray.700");// Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!prompt.trim() || isLoading) return;

        const result = await sendMessage(prompt);

        if (result.success) {
            // Handle specific actions
            if (result.data.action === "post" && result.data.actionResult?.success) {
                // Add new post to the posts state
                const newPost = result.data.actionResult.post;
                setPosts(prev => [newPost, ...prev]);
                showToast("Success", "Post created by AI! 🤖", "success");
            } else if (result.data.action === "read" && result.data.actionResult?.success) {
                const postsCount = result.data.actionResult.posts?.length || 0;
                showToast("Info", `AI found ${postsCount} posts in your feed 📖`, "info");
            } else if (result.data.action === "like" && result.data.actionResult?.success) {
                showToast("Success", "Post liked! ❤️", "success");
            } else if (result.data.action === "reply" && result.data.actionResult?.success) {
                showToast("Success", "Reply added! 💬", "success");
            } else if (result.data.action === "message" && result.data.actionResult?.success) {
                const recipient = result.data.actionResult.recipient;
                showToast("Success", `Message sent to ${recipient.username}! 📨`, "success");
            } else if (result.data.action === "find_user" && result.data.actionResult?.success) {
                const userCount = result.data.actionResult.users?.length || 0;
                showToast("Info", `Found ${userCount} user(s) 🔍`, "info");
            }
        } else {
            showToast("Error", result.error || "Failed to process AI command", "error");
        }

        setPrompt("");
    }; const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }; return (
        <Box
            position="fixed"
            bottom="4"
            right="4"
            width={isExpanded ? { base: "95vw", sm: "420px", md: "450px" } : "70px"}
            height={isExpanded ? { base: "80vh", sm: "520px", md: "560px" } : "70px"}
            maxWidth={isExpanded ? "95vw" : "70px"}
            maxHeight={isExpanded ? "85vh" : "70px"}
            bg={bgColor}
            border="2px solid"
            borderColor={isExpanded ? "blue.300" : borderColor}
            borderRadius="2xl"
            boxShadow={isExpanded ? "2xl" : "lg"}
            zIndex="1000"
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
                transform: isExpanded ? "scale(1)" : "scale(1.05)",
                boxShadow: isExpanded ? "2xl" : "xl",
            }}
            animation={!isExpanded ? `${pulse} 3s ease-in-out infinite` : undefined}
            overflow="hidden"
            display="flex"
            flexDirection="column"
        >{/* Enhanced Header */}
            <Flex
                p={isExpanded ? "4" : "0"}
                align="center"
                justify={isExpanded ? "space-between" : "center"}
                borderBottom={isExpanded ? "1px solid" : "none"}
                borderColor={borderColor}
                cursor="pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                bg={isExpanded ? "linear-gradient(135deg, blue.50, purple.50)" : "transparent"}
                borderTopRadius="2xl"
                position="relative"
                overflow="hidden"
                height={isExpanded ? "auto" : "70px"}
                width="100%"
                _hover={{
                    bg: isExpanded ? "linear-gradient(135deg, blue.100, purple.100)" : "gray.50",
                }}
                transition="all 0.3s ease"
            >
                {/* Animated background gradient */}
                {isExpanded && (
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bgGradient="linear(45deg, blue.400, purple.500, pink.400)"
                        opacity="0.05"
                        animation={`${float} 6s ease-in-out infinite`}
                    />
                )}

                {/* Collapsed state - centered icon */}
                {!isExpanded ? (
                    <Box
                        color="blue.500"
                        p="2"
                        borderRadius="full"
                        bg="white"
                        boxShadow="md"
                        transition="all 0.3s ease"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <BsRobot size={24} />
                    </Box>
                ) : (
                    /* Expanded state - left-aligned content */
                    <>
                        <HStack spacing={3} zIndex={1}>
                            <Box
                                color="blue.500"
                                p="2"
                                borderRadius="full"
                                bg="white"
                                boxShadow="md"
                                transition="all 0.3s ease"
                            >
                                <BsRobot size={24} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="md" color="gray.700">
                                    AI Assistant
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    {isLoading ? "Thinking..." : messages.length > 0 ? `${messages.length} messages` : "Ready to help!"}
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack spacing={2} zIndex={1}>
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearMessages();
                                }}
                                leftIcon={<BsTrash />}
                                colorScheme="red"
                                _hover={{ bg: "red.50" }}
                            >
                                Clear
                            </Button>
                            <IconButton
                                size="sm"
                                variant="ghost"
                                icon={<ChevronDownIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(false);
                                }}
                                borderRadius="full"
                                _hover={{ bg: "white", boxShadow: "md" }}
                            />
                        </HStack>
                    </>
                )}
            </Flex>            <Collapse in={isExpanded} animateOpacity>
                {/* Enhanced Messages Container */}
                <Box
                    height={{ base: "calc(85vh - 240px)", sm: "320px", md: "360px" }}
                    overflowY="auto"
                    bg={useColorModeValue("gray.25", "gray.900")}
                    css={{
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#CBD5E0',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: '#A0AEC0',
                        },
                    }}
                >
                    <VStack
                        spacing={3}
                        p={4}
                        align="stretch"
                        minHeight="100%"
                        justify={messages.length === 0 ? "center" : "flex-start"}
                    >                        {/* Enhanced Welcome Message */}
                        {messages.length === 0 && (
                            <VStack spacing={4} textAlign="center" color="gray.500" py={8}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg="linear-gradient(135deg, blue.100, purple.100)"
                                    color="blue.600"
                                    animation={`${float} 3s ease-in-out infinite`}
                                >
                                    <BsLightning size={24} />
                                </Box>
                                <VStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                        👋 Hi there!
                                    </Text>                                    <Text fontSize="sm" maxWidth="300px" lineHeight="1.5">
                                        I&apos;m your AI assistant! I can help you create posts, interact with content,
                                        message users, and much more.
                                    </Text>
                                </VStack>
                                <VStack spacing={2} align="start" fontSize="xs" color="gray.400" maxWidth="320px">
                                    <Text fontWeight="semibold" color="gray.600">Try saying:</Text>
                                    <Text>💬 &quot;Create a post about AI trends&quot;</Text>
                                    <Text>❤️ &quot;Like john&apos;s post about coffee&quot;</Text>
                                    <Text>💌 &quot;Send message to sarah: Hey there!&quot;</Text>
                                    <Text>🔍 &quot;Find user alex&quot;</Text>
                                </VStack>
                            </VStack>
                        )}                        {/* Enhanced Message Bubbles */}
                        {messages.map((message, index) => (
                            <Flex
                                key={index}
                                justify={message.role === "user" ? "flex-end" : "flex-start"}
                                mb={2}
                            >
                                <HStack
                                    spacing={3}
                                    maxWidth="85%"
                                    flexDirection={message.role === "user" ? "row-reverse" : "row"}
                                    align="flex-end"
                                >
                                    <Avatar
                                        size="sm"
                                        src={message.role === "user" ? user?.profilePic : undefined}
                                        name={message.role === "user" ? user?.username : "AI"}
                                        bg={message.role === "ai" ? "blue.500" : "gray.300"}
                                        icon={message.role === "ai" ? <BsRobot /> : undefined}
                                        border="2px solid white"
                                        boxShadow="md"
                                    />
                                    <Box
                                        bg={message.role === "user"
                                            ? "linear-gradient(135deg, blue.500, blue.600)"
                                            : "white"
                                        }
                                        color={message.role === "user" ? "white" : "gray.800"}
                                        px={4}
                                        py={3}
                                        borderRadius="2xl"
                                        fontSize="sm"
                                        maxWidth="100%"
                                        position="relative"
                                        boxShadow={message.role === "user" ? "md" : "sm"}
                                        border={message.role === "ai" ? "1px solid" : "none"}
                                        borderColor="gray.200"
                                        _before={message.role === "user" ? {
                                            content: '""',
                                            position: "absolute",
                                            right: "-8px",
                                            bottom: "8px",
                                            width: 0,
                                            height: 0,
                                            borderLeft: "8px solid",
                                            borderLeftColor: "blue.500",
                                            borderTop: "8px solid transparent",
                                        } : {
                                            content: '""',
                                            position: "absolute",
                                            left: "-8px",
                                            bottom: "8px",
                                            width: 0,
                                            height: 0,
                                            borderRight: "8px solid white",
                                            borderTop: "8px solid transparent",
                                        }}
                                    >
                                        <Text>{message.content}</Text>                                    {/* Show feed summaries if available */}
                                        {message.actionResult?.summaries && message.actionResult.summaries.length > 0 && (
                                            <VStack align="start" mt={2} spacing={1}>
                                                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                                    Recent Posts:
                                                </Text>
                                                {message.actionResult.summaries.slice(0, 3).map((summary, idx) => (
                                                    <Box key={idx} p={2} bg="gray.50" borderRadius="md" fontSize="xs">
                                                        <Text fontWeight="bold">@{summary.author}</Text>
                                                        <Text>{summary.text}</Text>
                                                        <Text color="gray.500">
                                                            {summary.likes} likes • {summary.replies} replies • {summary.timeAgo}
                                                        </Text>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        )}                                    {/* Show post interaction results */}
                                        {(message.action === "like" || message.action === "reply") && message.actionResult?.post && (
                                            <Box mt={2} p={2} bg="green.50" borderRadius="md" fontSize="xs">
                                                <Text fontSize="xs" fontWeight="bold" color="green.700">
                                                    {message.action === "like" ? "❤️ Liked Post:" : "💬 Replied to Post:"}
                                                </Text>
                                                <HStack spacing={2} mt={1}>
                                                    <Text fontWeight="bold">@{message.actionResult.post.author}</Text>
                                                    <Text color="gray.600">{message.actionResult.post.text}</Text>
                                                </HStack>
                                                <Text color="gray.500" fontSize="xx-small" mt={1}>
                                                    {message.actionResult.post.likes && `${message.actionResult.post.likes} likes • `}
                                                    {message.actionResult.post.replies && `${message.actionResult.post.replies} replies`}
                                                </Text>
                                            </Box>
                                        )}

                                        {/* Show enhanced user search results display */}
                                        {message.actionResult?.users && message.actionResult.users.length > 0 && (
                                            <VStack align="start" mt={2} spacing={2}>
                                                {/* Search summary header */}
                                                <Box p={2} bg="blue.50" borderRadius="md" fontSize="xs" width="100%">
                                                    <Text fontSize="xs" fontWeight="bold" color="blue.700">
                                                        🔍 Search Results for &quot;{message.actionResult.searchTerm || 'user search'}&quot;
                                                    </Text>
                                                    {message.actionResult.confidence && (
                                                        <Text color="gray.600" fontSize="xx-small">
                                                            Confidence: {message.actionResult.confidence} •
                                                            Found {message.actionResult.totalFound || message.actionResult.users.length} user(s)
                                                        </Text>
                                                    )}
                                                    {message.actionResult.bestMatch?.suggestion && (
                                                        <Text color="blue.600" fontSize="xx-small" fontStyle="italic" mt={1}>
                                                            {message.actionResult.bestMatch.suggestion}
                                                        </Text>
                                                    )}
                                                </Box>

                                                {/* User results with enhanced display */}
                                                {message.actionResult.users.slice(0, 3).map((user, userIndex) => (
                                                    <Box
                                                        key={userIndex}
                                                        p={2}
                                                        bg={userIndex === 0 ? "green.50" : "gray.50"}
                                                        borderRadius="md"
                                                        fontSize="xs"
                                                        width="100%"
                                                        border={userIndex === 0 ? "1px solid" : "none"}
                                                        borderColor={userIndex === 0 ? "green.200" : "transparent"}
                                                    >
                                                        <HStack spacing={2}>
                                                            <Avatar size="xs" src={user.profilePic} name={user.name} />
                                                            <VStack align="start" spacing={0} flex={1}>
                                                                <HStack spacing={1} wrap="wrap">
                                                                    <Text fontWeight="bold">@{user.username}</Text>
                                                                    {userIndex === 0 && (
                                                                        <Badge size="xs" colorScheme="green" fontSize="xx-small">
                                                                            Best
                                                                        </Badge>
                                                                    )}
                                                                    {user.matchType && (
                                                                        <Badge
                                                                            size="xs"
                                                                            fontSize="xx-small"
                                                                            colorScheme={
                                                                                user.matchType === 'exact' ? 'purple' :
                                                                                    user.matchType === 'partial' ? 'blue' : 'orange'
                                                                            }
                                                                        >
                                                                            {user.matchType === 'exact' ? 'Exact' :
                                                                                user.matchType === 'partial' ? 'Partial' :
                                                                                    user.score ? `${user.score}%` : 'Fuzzy'}
                                                                        </Badge>
                                                                    )}
                                                                </HStack>
                                                                <Text color="gray.600" fontSize="xx-small">{user.name}</Text>
                                                                {user.bio && (
                                                                    <Text color="gray.500" fontSize="xx-small" noOfLines={1}>
                                                                        {user.bio.substring(0, 40)}...
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                            <Button
                                                                size="xs"
                                                                colorScheme={userIndex === 0 ? "blue" : "gray"}
                                                                fontSize="xx-small"
                                                                onClick={() => setPrompt(`send message to ${user.username}: `)}
                                                            >
                                                                Message
                                                            </Button>
                                                        </HStack>
                                                    </Box>
                                                ))}

                                                {/* Show more indicator */}
                                                {message.actionResult.users.length > 3 && (
                                                    <Text fontSize="xx-small" color="gray.500" textAlign="center" width="100%">
                                                        +{message.actionResult.users.length - 3} more results available
                                                    </Text>
                                                )}
                                            </VStack>
                                        )}

                                        {/* Show message recipient if available */}
                                        {message.actionResult?.recipient && (
                                            <Box mt={2} p={2} bg="blue.50" borderRadius="md" fontSize="xs">
                                                <HStack spacing={2}>
                                                    <Avatar size="xs" src={message.actionResult.recipient.profilePic} name={message.actionResult.recipient.name} />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="bold">Message sent to:</Text>
                                                        <Text>@{message.actionResult.recipient.username} ({message.actionResult.recipient.name})</Text>
                                                    </VStack>
                                                </HStack>
                                            </Box>
                                        )}                                    {message.action && message.action !== "chat" && (
                                            <Badge
                                                size="sm"
                                                colorScheme={message.actionResult?.success ? "green" : "red"}
                                                mt={1}
                                            >
                                                {message.action === "post" && "📝 "}
                                                {message.action === "read" && "👁️ "}
                                                {message.action === "like" && "❤️ "}
                                                {message.action === "reply" && "💬 "}
                                                {message.action === "message" && "📨 "}
                                                {message.action === "find_user" && "🔍 "}
                                                {message.action.toUpperCase()}
                                            </Badge>
                                        )}
                                    </Box>
                                </HStack>
                            </Flex>
                        ))}                        {/* Enhanced Loading Indicator */}
                        {isLoading && (
                            <Flex justify="flex-start" mb={2}>
                                <HStack spacing={3} align="flex-end">
                                    <Avatar
                                        size="sm"
                                        bg="blue.500"
                                        icon={<BsRobot />}
                                        border="2px solid white"
                                        boxShadow="md"
                                    />
                                    <Box
                                        bg="white"
                                        px={4}
                                        py={3}
                                        borderRadius="2xl"
                                        fontSize="sm"
                                        boxShadow="sm"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        position="relative"
                                        _before={{
                                            content: '""',
                                            position: "absolute",
                                            left: "-8px",
                                            bottom: "8px",
                                            width: 0,
                                            height: 0,
                                            borderRight: "8px solid white",
                                            borderTop: "8px solid transparent",
                                        }}
                                    >
                                        <HStack spacing={2}>
                                            <Spinner size="sm" color="blue.500" />
                                            <Text color="gray.600">AI is thinking...</Text>
                                        </HStack>
                                    </Box>
                                </HStack>
                            </Flex>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </VStack>
                </Box>                {/* Enhanced Input Area */}
                <Box
                    p={{ base: 3, sm: 4 }}
                    borderTop="1px solid"
                    borderColor={borderColor}
                    bg={useColorModeValue("white", "gray.800")}
                    borderBottomRadius="2xl"
                    minHeight={{ base: "140px", sm: "160px" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    <VStack spacing={3}>                        {/* Quick action buttons */}
                        <HStack spacing={2} width="100%" justify="center" wrap="wrap">
                            <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<Text>📝</Text>}
                                onClick={() => setPrompt("Create a post about ")}
                                fontSize={{ base: "xx-small", sm: "xs" }}
                                minWidth={{ base: "60px", sm: "auto" }}
                                _hover={{ bg: "blue.50" }}
                            >
                                <Text display={{ base: "none", sm: "block" }}>Post</Text>
                            </Button>
                            <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<Text>❤️</Text>}
                                onClick={() => setPrompt("Like ")}
                                fontSize={{ base: "xx-small", sm: "xs" }}
                                minWidth={{ base: "60px", sm: "auto" }}
                                _hover={{ bg: "red.50" }}
                            >
                                <Text display={{ base: "none", sm: "block" }}>Like</Text>
                            </Button>
                            <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<Text>💬</Text>}
                                onClick={() => setPrompt("Reply to ")}
                                fontSize={{ base: "xx-small", sm: "xs" }}
                                minWidth={{ base: "60px", sm: "auto" }}
                                _hover={{ bg: "green.50" }}
                            >
                                <Text display={{ base: "none", sm: "block" }}>Reply</Text>
                            </Button>
                            <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<Text>🔍</Text>}
                                onClick={() => setPrompt("Find user ")}
                                fontSize={{ base: "xx-small", sm: "xs" }}
                                minWidth={{ base: "60px", sm: "auto" }}
                                _hover={{ bg: "purple.50" }}
                            >
                                <Text display={{ base: "none", sm: "block" }}>Find</Text>
                            </Button>
                        </HStack>                        {/* Input field with send button */}
                        <HStack spacing={3} width="100%" align="flex-end">
                            <Box flex={1} position="relative">
                                <Textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything... ✨"
                                    size="md"
                                    resize="none"
                                    rows={3}
                                    minHeight="60px"
                                    isDisabled={isLoading}
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor={prompt.length > 0 ? "blue.300" : "gray.300"}
                                    bg={inputBgColor}
                                    color={inputTextColor}
                                    fontSize="sm"
                                    fontWeight="normal"
                                    _placeholder={{
                                        color: inputPlaceholderColor,
                                        fontSize: "sm"
                                    }}
                                    _focus={{
                                        borderColor: "blue.400",
                                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                                        bg: inputFocusBgColor
                                    }}
                                    _hover={{
                                        borderColor: prompt.length > 0 ? "blue.400" : "gray.400",
                                    }}
                                    transition="all 0.2s ease"
                                />
                                {/* Character count indicator */}
                                {prompt.length > 0 && (
                                    <Text
                                        position="absolute"
                                        bottom={2}
                                        right={3}
                                        fontSize="xs"
                                        color="gray.400"
                                        bg={charCountBgColor}
                                        px={1}
                                        borderRadius="sm"
                                    >
                                        {prompt.length}
                                    </Text>
                                )}
                            </Box>                            <Button
                                size="lg"
                                colorScheme="blue"
                                onClick={handleSendMessage}
                                isLoading={isLoading}
                                borderRadius="xl"
                                minWidth="70px"
                                height="60px"
                                bgGradient="linear(135deg, blue.400, blue.600)"
                                _hover={{
                                    bgGradient: "linear(135deg, blue.500, blue.700)",
                                    transform: "translateY(-1px)",
                                }}
                                _active={{
                                    transform: "translateY(0px)",
                                }}
                                transition="all 0.2s ease"
                                leftIcon={<BsSend />}
                                iconSpacing={{ base: 0, sm: 1 }}
                                isDisabled={!prompt.trim() || isLoading}
                            >
                                {/* Button text hidden on mobile for icon-only look */}
                                <Text display={{ base: "none", sm: "block" }}>
                                    Send
                                </Text>
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </Collapse>
        </Box>
    );
};

export default AiChatBox;
