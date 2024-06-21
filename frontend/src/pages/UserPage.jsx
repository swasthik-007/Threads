import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
// import { Flex, Spinner } from "@chakra-ui/react";
// import Post from "../components/Post";
// import useGetUserProfile from "../hooks/useGetUserProfile";
// import { useRecoilState } from "recoil";
// import postsAtom from "../atoms/postsAtom";

const UserPage = () => {
    // const { user, loading } = useGetUserProfile();
    const [user, setUser] = useState(null);
    const { username } = useParams();
    const showToast = useShowToast();
    // const [posts, setPosts] = useRecoilState(postsAtom);
    // const [fetchingPosts, setFetchingPosts] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            // setFetchingPosts(true);
            try {
                const res = await fetch(`/api/users/profile/${username}`);
                const data = await res.json();
                console.log(data);
                // setPosts(data);
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return
                }
                setUser(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            }
        };

        getUser();
    }, [username, showToast]);
    if (!user) return null;

    return (
        <>
            <UserHeader user={user} />

        </>
    )
}

export default UserPage;