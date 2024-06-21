import { Button, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";


const HomePage = () => {
    return (
        <Link to={"/markZuckerberg"}>
            <Flex w={"full"} justifyContent={"center"}>
                <Button mx={"auto"}>Visit Profile Page</Button>

            </Flex>
        </Link>
    )
}

export default HomePage