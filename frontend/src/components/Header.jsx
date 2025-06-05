import { Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { motion } from "framer-motion";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const user = useRecoilValue(userAtom);
    const logout = useLogout();
    const setAuthScreen = useSetRecoilState(authScreenAtom); return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
            <Flex justifyContent={"space-between"} mt={6} mb='12'>
                {user && (
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link as={RouterLink} to='/'>
                            <AiFillHome size={24} />
                        </Link>
                    </motion.div>
                )}
                {!user && (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
                            Login
                        </Link>
                    </motion.div>
                )}

                <Image
                    cursor={"pointer"}
                    alt='logo'
                    w={6}
                    src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
                    onClick={toggleColorMode}
                />

                {user && (
                    <Flex alignItems={"center"} gap={4}>
                        <Link as={RouterLink} to={`/${user.username}`}>
                            <RxAvatar size={24} />
                        </Link>
                        <Link as={RouterLink} to={`/chat`}>
                            <BsFillChatQuoteFill size={20} />
                        </Link>
                        <Link as={RouterLink} to={`/settings`}>
                            <MdOutlineSettings size={20} />
                        </Link>
                        <Button size={"xs"} onClick={logout}>
                            <FiLogOut size={20} />
                        </Button>
                    </Flex>
                )}

                {!user && (
                    <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")}>
                        Sign up
                    </Link>
                )}
            </Flex>
        </motion.div>
    );
};

export default Header;