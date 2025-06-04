import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";

const genAI = new GoogleGenerativeAI("AIzaSyAF4OVvkGi7HvWNw2CWPzz_eWf3jZ-xe-k");

const processAICommand = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Create a system prompt that defines the AI's capabilities
    const systemPrompt = `You are an AI assistant for a social media app called Threads. You help users interact with their social feed through natural language.

Available Commands:
1. POST - Create new posts
2. READ - Get recent feed posts  
3. CHAT - General conversation
4. LIKE - Like posts by description or author
5. REPLY - Reply to posts by description or author
6. MESSAGE - Send message to other users
7. FIND_USER - Find users to chat with

User Context:
- Username: ${user.username}
- Name: ${user.name}
- Bio: ${user.bio}

CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or extra text.

Required JSON format:
{
  "action": "post|read|chat|like|reply|message|find_user",
  "content": "text content for posts/replies/messages (only if creating post, reply, or message)",
  "message": "friendly response to user",
  "postDescription": "description of the post to like/reply to (for like/reply actions)",
  "authorUsername": "username of post author (for like/reply actions)",
  "username": "username if needed (for message/find_user actions)",
  "confidence": 0.8
}

Examples:
- "Create a post about AI" → {"action": "post", "content": "Exploring the fascinating world of AI technology! #AI #Tech", "message": "I'll create an engaging post about AI for you!", "confidence": 0.9}
- "Show my feed" → {"action": "read", "message": "Let me fetch your latest posts!", "confidence": 0.95}
- "Hello there" → {"action": "chat", "message": "Hello! I'm here to help you with posting, reading your feed, or just chat. What would you like to do?", "confidence": 0.8}
- "Like the post about AI by john" → {"action": "like", "postDescription": "AI", "authorUsername": "john", "message": "I'll like john's post about AI!", "confidence": 0.85}
- "Reply to sarah's latest post: Great idea!" → {"action": "reply", "content": "Great idea!", "authorUsername": "sarah", "message": "I'll reply to sarah's latest post!", "confidence": 0.9}
- "Send message to john: Hello!" → {"action": "message", "content": "Hello!", "username": "john", "message": "I'll send your message to john!", "confidence": 0.9}
- "Find user alex" → {"action": "find_user", "username": "alex", "message": "I'll help you find and start a chat with alex!", "confidence": 0.85}

User Request: "${prompt}"

Respond with ONLY the JSON object, no other text:`;
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response text to extract JSON
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let aiResponse;
    try {
      // Try to parse as JSON first
      aiResponse = JSON.parse(text);

      // Validate that we have the required fields
      if (!aiResponse.action) {
        throw new Error("Invalid AI response format");
      }
    } catch (e) {
      console.log("Failed to parse AI response as JSON:", text);
      // If not JSON, treat as a chat response
      aiResponse = {
        action: "chat",
        message:
          text ||
          "I'm here to help! Try asking me to create a post or read your feed.",
        confidence: 0.5,
      };
    }

    // Execute the action based on AI's interpretation
    let actionResult = null;
    switch (aiResponse.action) {
      case "post":
        if (aiResponse.content) {
          actionResult = await createPostFromAI(userId, aiResponse.content);
        }
        break;
      case "read":
        actionResult = await getFeedPostsForAI(userId);
        break;
      case "like":
        if (aiResponse.postDescription || aiResponse.authorUsername) {
          actionResult = await likePostFromAI(
            userId,
            aiResponse.postDescription,
            aiResponse.authorUsername
          );
        }
        break;
      case "reply":
        if (
          aiResponse.content &&
          (aiResponse.postDescription || aiResponse.authorUsername)
        ) {
          actionResult = await replyToPostFromAI(
            userId,
            aiResponse.postDescription,
            aiResponse.authorUsername,
            aiResponse.content
          );
        }
        break;
      case "message":
        if (aiResponse.username && aiResponse.content) {
          actionResult = await sendMessageFromAI(
            userId,
            aiResponse.username,
            aiResponse.content
          );
        }
        break;
      case "find_user":
        if (aiResponse.username) {
          actionResult = await findUserFromAI(aiResponse.username);
        }
        break;
      case "chat":
      default:
        // Just return the AI's message
        break;
    }

    res.status(200).json({
      aiResponse: aiResponse.message,
      action: aiResponse.action,
      actionResult,
    });
  } catch (error) {
    console.error("AI processing error:", error);

    // Check for specific API key errors
    if (error.message && error.message.includes("API_KEY_INVALID")) {
      return res.status(400).json({
        error: "Invalid API key. Please check your Gemini API configuration.",
        message: "The AI service cannot authenticate. Please contact support.",
        details: "API_KEY_INVALID",
      });
    }

    if (error.message && error.message.includes("API key not valid")) {
      return res.status(400).json({
        error: "API key not valid. Please pass a valid API key.",
        message:
          "The AI service is not properly configured. Please contact support.",
        details: "INVALID_API_KEY",
      });
    }

    res.status(500).json({
      error: "Failed to process AI command",
      message:
        "Something went wrong while processing your request. Please try again.",
    });
  }
};

// Helper functions
const createPostFromAI = async (userId, text) => {
  try {
    const user = await User.findById(userId);

    // Enhance the post content if it's too short
    let postContent = text;
    if (text.length < 20) {
      postContent = `${text} 🤖 #AIGenerated #Threads`;
    }

    const newPost = new Post({
      postedBy: userId,
      text: postContent,
    });

    await newPost.save();

    // Populate the user info for the response
    await newPost.populate("postedBy", "username name profilePic");

    return {
      success: true,
      post: newPost,
      message: `Post created successfully! "${postContent.substring(0, 50)}${
        postContent.length > 50 ? "..." : ""
      }"`,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      message: "Failed to create post. Please try again.",
    };
  }
};

const getFeedPostsForAI = async (userId) => {
  try {
    const user = await User.findById(userId);
    const following = user.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("postedBy", "username name profilePic");

    // Create a summary of the posts
    const postSummaries = feedPosts.map((post) => ({
      id: post._id,
      author: post.postedBy.username,
      text: post.text.substring(0, 100) + (post.text.length > 100 ? "..." : ""),
      likes: post.likes.length,
      replies: post.replies.length,
      timeAgo: new Date(post.createdAt).toLocaleDateString(),
    }));

    return {
      success: true,
      posts: feedPosts,
      summaries: postSummaries,
      message: `Found ${
        feedPosts.length
      } recent posts from people you follow. ${
        feedPosts.length > 0
          ? "Here are the latest updates!"
          : "Try following more users to see content in your feed."
      }`,
    };
  } catch (error) {
    console.error("Error fetching feed:", error);
    return {
      success: false,
      message: "Failed to fetch your feed. Please try again.",
    };
  }
};

const likePostFromAI = async (userId, postDescription, authorUsername) => {
  try {
    const post = await findPostByDescription(
      userId,
      postDescription,
      authorUsername
    );
    if (!post.success) {
      return post; // Return the error response
    }

    const foundPost = post.post;
    if (foundPost.likes.includes(userId)) {
      return {
        success: false,
        message: `You already liked @${
          foundPost.postedBy.username
        }'s post: "${foundPost.text.substring(0, 50)}..."`,
      };
    }

    foundPost.likes.push(userId);
    await foundPost.save();

    return {
      success: true,
      message: `Liked @${
        foundPost.postedBy.username
      }'s post: "${foundPost.text.substring(0, 50)}..."`,
      post: {
        _id: foundPost._id,
        author: foundPost.postedBy.username,
        text: foundPost.text.substring(0, 100),
        likes: foundPost.likes.length,
      },
    };
  } catch (error) {
    console.error("Error liking post:", error);
    return {
      success: false,
      message: "Failed to like post. Please try again.",
    };
  }
};

const replyToPostFromAI = async (
  userId,
  postDescription,
  authorUsername,
  replyText
) => {
  try {
    const post = await findPostByDescription(
      userId,
      postDescription,
      authorUsername
    );
    if (!post.success) {
      return post; // Return the error response
    }

    const foundPost = post.post;
    const user = await User.findById(userId);

    const reply = {
      userId,
      text: replyText,
      userProfilePic: user.profilePic,
      username: user.username,
    };

    foundPost.replies.push(reply);
    await foundPost.save();

    return {
      success: true,
      message: `Replied to @${foundPost.postedBy.username}'s post: "${replyText}"`,
      post: {
        _id: foundPost._id,
        author: foundPost.postedBy.username,
        text: foundPost.text.substring(0, 100),
        replies: foundPost.replies.length,
      },
    };
  } catch (error) {
    console.error("Error replying to post:", error);
    return {
      success: false,
      message: "Failed to add reply. Please try again.",
    };
  }
};

// Helper function to find posts by description and/or author
const findPostByDescription = async (
  userId,
  postDescription,
  authorUsername
) => {
  try {
    const user = await User.findById(userId);
    const following = user.following;
    following.push(userId); // Include user's own posts

    let query = { postedBy: { $in: following } };

    // If author is specified, find that user first
    if (authorUsername) {
      const author = await User.findOne({
        username: { $regex: new RegExp(`^${authorUsername}$`, "i") },
      });

      if (!author) {
        return {
          success: false,
          message: `User "@${authorUsername}" not found. Please check the username.`,
        };
      }

      query.postedBy = author._id;
    }

    // Get recent posts from the feed
    let posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(20) // Get more posts to search through
      .populate("postedBy", "username name profilePic");

    if (posts.length === 0) {
      return {
        success: false,
        message: authorUsername
          ? `No posts found from @${authorUsername}`
          : "No posts found in your feed to interact with.",
      };
    }

    let targetPost = null;

    // If description is provided, find the best matching post
    if (postDescription) {
      const searchTerm = postDescription.toLowerCase();

      // Score posts by relevance
      const scoredPosts = posts.map((post) => {
        const postText = post.text.toLowerCase();
        let score = 0;

        // Exact phrase match gets highest score
        if (postText.includes(searchTerm)) {
          score += 100;
        }

        // Word matches
        const searchWords = searchTerm.split(" ");
        const postWords = postText.split(" ");

        searchWords.forEach((searchWord) => {
          postWords.forEach((postWord) => {
            if (
              postWord.includes(searchWord) ||
              searchWord.includes(postWord)
            ) {
              score += 10;
            }
          });
        });

        return { post, score };
      });

      // Sort by score and get the best match
      scoredPosts.sort((a, b) => b.score - a.score);

      if (scoredPosts[0].score > 0) {
        targetPost = scoredPosts[0].post;
      } else {
        return {
          success: false,
          message: `No posts found matching "${postDescription}"${
            authorUsername ? ` by @${authorUsername}` : " in your feed"
          }.`,
        };
      }
    } else {
      // If no description, get the most recent post
      targetPost = posts[0];
    }

    return {
      success: true,
      post: targetPost,
      message: `Found post by @${
        targetPost.postedBy.username
      }: "${targetPost.text.substring(0, 100)}..."`,
    };
  } catch (error) {
    console.error("Error finding post:", error);
    return {
      success: false,
      message: "Failed to find the post. Please try again.",
    };
  }
};

const sendMessageFromAI = async (senderId, recipientUsername, messageText) => {
  try {
    // Find the recipient user by username
    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      return {
        success: false,
        message: `User "${recipientUsername}" not found. Please check the username and try again.`,
      };
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipient._id] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipient._id],
        lastMessage: {
          text: messageText,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: messageText,
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: messageText,
          sender: senderId,
        },
      }),
    ]);

    // Send real-time message via WebSocket
    const recipientSocketId = getRecipientSocketId(recipient._id);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    return {
      success: true,
      message: `Message sent to ${recipientUsername} successfully! 💬`,
      conversation: conversation._id,
      recipient: {
        _id: recipient._id,
        username: recipient.username,
        name: recipient.name,
        profilePic: recipient.profilePic,
      },
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      message: "Failed to send message. Please try again.",
    };
  }
};

// Enhanced fuzzy matching with multiple algorithms
const calculateSimilarity = (str1, str2) => {
  // Normalize strings
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // If strings are identical, return perfect match
  if (s1 === s2) return 1.0;

  // If one string is contained in the other, give high score
  if (s1.includes(s2) || s2.includes(s1)) {
    const longer = Math.max(s1.length, s2.length);
    const shorter = Math.min(s1.length, s2.length);
    return (shorter / longer) * 0.95; // High but not perfect score
  }

  // Levenshtein distance calculation
  const matrix = [];
  const len1 = s1.length;
  const len2 = s2.length;

  // Create matrix
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix with optimized weights for common typos
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Give lower penalty for common character substitutions
        let substitutionCost = 1;
        const char1 = s1.charAt(j - 1);
        const char2 = s2.charAt(i - 1);

        // Common typos get lower penalty
        if (areCommonTypos(char1, char2)) {
          substitutionCost = 0.7;
        }

        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + substitutionCost, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);

  // Calculate base similarity
  let similarity = 1 - distance / maxLen;

  // Bonus for similar starting characters
  if (s1[0] === s2[0]) {
    similarity += 0.1;
  }

  // Bonus for similar length
  const lengthRatio = Math.min(len1, len2) / Math.max(len1, len2);
  similarity += lengthRatio * 0.1;

  // Ensure similarity doesn't exceed 1.0
  return Math.min(similarity, 1.0);
};

// Helper function to identify common character typos
const areCommonTypos = (char1, char2) => {
  const commonSwaps = {
    a: ["e", "o"],
    e: ["a", "i"],
    i: ["e", "o"],
    o: ["a", "i", "u"],
    u: ["o", "i"],
    b: ["v", "p"],
    v: ["b", "f"],
    c: ["k", "s"],
    k: ["c"],
    s: ["c", "z"],
    z: ["s"],
    d: ["t"],
    t: ["d"],
    f: ["v", "ph"],
    g: ["j"],
    j: ["g"],
    l: ["1"],
    m: ["n"],
    n: ["m"],
    p: ["b"],
    q: ["k"],
    r: ["l"],
    w: ["v"],
    x: ["s"],
    y: ["i"],
  };

  return (
    commonSwaps[char1]?.includes(char2) || commonSwaps[char2]?.includes(char1)
  );
};

const findUserFromAI = async (username) => {
  try {
    const searchTerm = username.toLowerCase().trim();

    // Get all users for comprehensive search
    const allUsers = await User.find({})
      .select("username name profilePic bio")
      .lean();

    let matchedUsers = [];

    // 1. Exact username match (highest priority)
    const exactMatches = allUsers.filter(
      (user) => user.username.toLowerCase() === searchTerm
    );

    if (exactMatches.length > 0) {
      matchedUsers = exactMatches.map((user) => ({
        ...user,
        matchType: "exact",
        similarity: 1.0,
        score: 100,
      }));
    } else {
      // 2. Partial matches in username or name
      const partialMatches = allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm) ||
          (user.name && user.name.toLowerCase().includes(searchTerm))
      );

      // 3. Calculate fuzzy similarity for all users
      const scoredUsers = allUsers.map((user) => {
        const usernameSimilarity = calculateSimilarity(
          searchTerm,
          user.username.toLowerCase()
        );
        const nameSimilarity = user.name
          ? calculateSimilarity(searchTerm, user.name.toLowerCase())
          : 0;
        const maxSimilarity = Math.max(usernameSimilarity, nameSimilarity);

        // Determine match type
        let matchType = "fuzzy";
        if (
          partialMatches.some((p) => p._id.toString() === user._id.toString())
        ) {
          matchType = "partial";
        }

        return {
          ...user,
          similarity: maxSimilarity,
          score: Math.round(maxSimilarity * 100),
          matchType,
          matchedField:
            usernameSimilarity > nameSimilarity ? "username" : "name",
        };
      });

      // Filter users with similarity above threshold (55% for more inclusive search)
      const similarUsers = scoredUsers.filter(
        (user) => user.similarity >= 0.55
      );

      // Sort by similarity score (highest first), then by match type priority
      matchedUsers = similarUsers.sort((a, b) => {
        // Prioritize exact > partial > fuzzy, then by similarity
        const typeOrder = { exact: 3, partial: 2, fuzzy: 1 };
        const typeDiff = typeOrder[b.matchType] - typeOrder[a.matchType];
        if (typeDiff !== 0) return typeDiff;
        return b.similarity - a.similarity;
      });
    }

    // Limit to top 8 results for better UX
    matchedUsers = matchedUsers.slice(0, 8);

    if (matchedUsers.length === 0) {
      return {
        success: false,
        message: `No users found similar to "${username}". Try checking the spelling or using a different search term.`,
        suggestions: [
          "Double-check the spelling",
          "Try searching with just the first few letters",
          "Use their display name instead of username",
        ],
      };
    }

    // Format response with detailed match information
    const bestMatch = matchedUsers[0];
    let message = "";
    let confidence = "high";

    if (bestMatch.matchType === "exact") {
      message = `Perfect match found: @${bestMatch.username}`;
      confidence = "perfect";
    } else if (bestMatch.score >= 85) {
      message = `Found strong match: @${bestMatch.username} (${bestMatch.score}% similarity)`;
      confidence = "high";
    } else if (bestMatch.score >= 70) {
      message = `Found likely match: @${bestMatch.username} (${bestMatch.score}% similarity)`;
      confidence = "medium";
    } else {
      message = `Found possible matches for "${username}". Best guess: @${bestMatch.username} (${bestMatch.score}% similarity)`;
      confidence = "low";
    }

    // Add context for multiple results
    if (matchedUsers.length > 1) {
      message += ` and ${matchedUsers.length - 1} other${
        matchedUsers.length > 2 ? "s" : ""
      }`;
    }

    return {
      success: true,
      users: matchedUsers,
      message,
      confidence,
      searchTerm: username,
      bestMatch: {
        ...bestMatch,
        suggestion:
          bestMatch.score < 85
            ? `Did you mean "@${bestMatch.username}"?`
            : null,
      },
      totalFound: matchedUsers.length,
    };
  } catch (error) {
    console.error("Error finding users:", error);
    return {
      success: false,
      message: "Failed to search for users. Please try again.",
      error: error.message,
    };
  }
};

export { processAICommand };
