import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";

const Comment = ({ reply, lastReply }) => {
    return (
        <>
            <Flex gap={4} py={2} my={2} w={"full"}>
                <Avatar src='/zuck-avatar.png' size={"sm"} />
                <Flex gap={1} w={"full"} flexDirection={"column"}>
                    <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                        <Text fontSize='sm' fontWeight='bold'>
                            Mark
                        </Text>
                    </Flex>
                    <Text>1d</Text>
                    <BsThreeDots />
                </Flex>
            </Flex>
            {!lastReply ? <Divider /> : null}
        </>
    );
};

export default Comment;