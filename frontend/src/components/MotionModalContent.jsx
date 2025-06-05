import { motion } from 'framer-motion';
import { ModalContent } from '@chakra-ui/react';
import { forwardRef } from 'react';

// This component wraps ModalContent with framer-motion
const MotionModalContent = motion(forwardRef((props, ref) => {
    return <ModalContent ref={ref} {...props} />;
}));

export default MotionModalContent;
