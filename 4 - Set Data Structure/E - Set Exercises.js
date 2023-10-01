import {
  itemIds,
  itemsKey,
  getItems,
} from "../3 - Hash Data Structure/E - Hash Exercises.js";

import { getClient } from "../client.js";
const client = getClient();

// Generate keys with helper functions to avoid mistakes.
export const userLikesKey = (userId) => `users:likes#${userId}`;

export const userLikesItem = async (itemId, userId) => {
  return client.sIsMember(userLikesKey(userId), itemId);
};

export const likedItems = async (userId) => {
  const ids = await client.sMembers(userLikesKey(userId));
  return getItems(ids);
};

export const likeItem = async (itemId, userId) => {
  const inserted = await client.sAdd(userLikesKey(userId), itemId);
  if (inserted) return client.hIncrBy(itemsKey(itemId), "likes", 1);
};

export const unlikeItem = async (itemId, userId) => {
  const removed = await client.sRem(userLikesKey(userId), itemId);
  if (removed) return client.hIncrBy(itemsKey(itemId), "likes", -1);
};

export const commonLikedItems = async (userOneId, userTwoId) => {
  const ids = await client.sInter([
    userLikesKey(userOneId),
    userLikesKey(userTwoId),
  ]);
  return getItems(ids);
};

async function main() {
  const userIds = [
    Math.floor(Math.random() * 1000).toString(),
    Math.floor(Math.random() * 1000).toString(),
  ];

  {
    await likeItem(itemIds[0], userIds[0]);
    await likeItem(itemIds[1], userIds[0]);
    console.log("----ITEM LIKES ----");
    const item = await client.hGetAll(itemsKey(itemIds[0]));
    console.log(item.likes);
    console.log("----DOES USER LIKE ITEM----");
    const isLiked = await userLikesItem(itemIds[0], userIds[0]);
    console.log(isLiked);
    console.log("----USER LIKED ITEMS----");
    const liked = await likedItems(userIds[0]);
    console.log(liked);
  }

  {
    await unlikeItem(itemIds[0], userIds[0]);
    const isLiked = await userLikesItem(itemIds[0], userIds[0]);
    const liked = await likedItems(userIds[0]);
    console.log("----ITEM LIKES ----");
    const item = await client.hGetAll(itemsKey(itemIds[0]));
    console.log(item.likes);
    console.log("----DOES USER LIKE ITEM----");
    console.log(isLiked);
    console.log("----USER LIKED ITEMS----");
    console.log(liked);
  }

  {
    await likeItem(itemIds[1], userIds[1]);
    const liked = await commonLikedItems(userIds[0], userIds[1]);
    console.log("----COMMON LIKED ITEMS----");
    console.log(liked);
  }

  return userIds;
}
const userIds = await main();
export { userIds };
