import {
    Box,
    Button,
    VStack,
    Text,
    Heading,
    useColorModeValue,
    Code,
    Alert,
    AlertIcon,
    List,
    ListItem,
    ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { BsRobot } from "react-icons/bs";

const AiFeatureDemo = () => {
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const exampleCommands = [
        {
            command: "Create a post about AI technology",
            description: "AI will generate and post content about AI technology"
        },
        {
            command: "Show me what's new in my feed",
            description: "AI will fetch and summarize your recent feed posts"
        },
        {
            command: "Post: Just finished a great workout! 💪",
            description: "AI will create a post with your exact content"
        },
        {
            command: "What can you help me with?",
            description: "AI will explain its capabilities in a friendly chat"
        }
    ];

    return (
        <Box
            maxWidth="600px"
            mx="auto"
            p={6}
            bg={bgColor}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            mt={4}
        >
            <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                    <Box color="blue.500" mb={2}>
                        <BsRobot size={40} style={{ margin: "0 auto" }} />
                    </Box>
                    <Heading size="lg" mb={2}>
                        AI Chat Assistant
                    </Heading>
                    <Text color="gray.600">
                        Powered by Google Gemini - Your intelligent social media companion
                    </Text>
                </Box>

                <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    Look for the AI chat bot in the bottom-right corner when you're logged in!
                </Alert>

                <Box>
                    <Heading size="md" mb={4}>
                        What can the AI do?
                    </Heading>
                    <List spacing={3}>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Create Posts:</strong> Generate and publish posts based on your ideas
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Read Your Feed:</strong> Summarize recent posts from people you follow
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Chat & Help:</strong> Answer questions and provide assistance
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Like & Reply:</strong> Interact with specific posts (with post ID)
                        </ListItem>
                    </List>
                </Box>

                <Box>
                    <Heading size="md" mb={4}>
                        Try These Example Commands:
                    </Heading>
                    <VStack spacing={3} align="stretch">
                        {exampleCommands.map((example, index) => (
                            <Box key={index} p={3} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                                <Code p={2} borderRadius="md" display="block" mb={2}>
                                    {example.command}
                                </Code>
                                <Text fontSize="sm" color="gray.600">
                                    {example.description}
                                </Text>
                            </Box>
                        ))}
                    </VStack>
                </Box>

                <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <Text fontWeight="bold">Getting Started:</Text>
                        <Text fontSize="sm">
                            1. Make sure you're logged in
                            2. Look for the robot icon 🤖 in the bottom-right corner
                            3. Click to expand the chat and start typing your commands!
                        </Text>
                    </Box>
                </Alert>
            </VStack>
        </Box>
    );
};

export default AiFeatureDemo;
