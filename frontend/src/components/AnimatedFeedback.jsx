import { useEffect, useState } from 'react';
import { Box, Center, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const emojis = ['✨', '🎉', '🚀', '👏', '💯'];

const AnimatedFeedback = ({ isVisible, onComplete }) => {
    const [randomEmoji] = useState(() => emojis[Math.floor(Math.random() * emojis.length)]);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onComplete();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    zIndex={1500}
                    bg="rgba(0,0,0,0.5)"
                    backdropFilter="blur(5px)"
                >
                    <Center h="100%">
                        <motion.div
                            initial={{ scale: 0.4, opacity: 0, y: 20 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.4,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }
                            }}
                            exit={{
                                scale: 1.2,
                                opacity: 0,
                                transition: { duration: 0.3 }
                            }}
                        >
                            <Text fontSize="6xl">{randomEmoji}</Text>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: { delay: 0.1, duration: 0.3 }
                                }}
                            >
                                <Text
                                    fontSize="xl"
                                    fontWeight="bold"
                                    textAlign="center"
                                    color="white"
                                >
                                    Post published!
                                </Text>
                            </motion.div>
                        </motion.div>
                    </Center>
                </Box>
            )}
        </AnimatePresence>
    );
};

export default AnimatedFeedback;
