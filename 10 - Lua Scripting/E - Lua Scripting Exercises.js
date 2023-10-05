import dotenv from "dotenv";
import { createClient, defineScript } from "redis";
dotenv.config({ path: "../.env" });

// Generate keys with helper functions to avoid mistakes.
const teamsKey = (teamId) => `teams#${teamId}`;
const teamsMembersKey = (teamId) => `teams:members#${teamId}`;
const teamsByMembersKey = () => `teams:members`;

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PW,
  scripts: {
    joinTeam: defineScript({
      NUMBER_OF_KEYS: 3,
      SCRIPT: `
                local teamsMembersKey = KEYS[1]
                local teamsKey = KEYS[2]
                local teamsByMembersKey = KEYS[3]
                local teamId = ARGV[1]
                local userId = ARGV[2]

                local inserted = redis.call('PFADD', teamsMembersKey, userId)
                if inserted == 1 then
                    redis.call('HINCRBY', teamsKey, 'members', 1)
                    redis.call('ZINCRBY', teamsByMembersKey, 1, teamId)
                end

                return inserted
              `,
      transformArguments(teamId, userId) {
        return [
          teamsMembersKey(teamId),
          teamsKey(teamId),
          teamsByMembersKey(),
          teamId.toString(),
          userId.toString(),
        ];
      },
      transformReply(reply) {
        return reply;
      },
    }),
  },
});

client.on("connect", async () => {
  const userId = 0;
  const teamId = 0;
  console.log("----RESULT----");
  const result = await client.joinTeam(teamId, userId);
  console.log(result);
  console.log("----TEAM----");
  const team = await client.hGetAll(teamsKey(teamId));
  console.log(team);
  console.log("----MEMBERS----");
  const members = await client.zRangeByScoreWithScores(
    teamsByMembersKey(),
    "-inf",
    "+inf"
  );
  console.log(members);
  console.log("----MEMBER COUNT----");
  const memberCount = await client.pfCount(teamsMembersKey(teamId));
  console.log(memberCount);
});

client.on("error", (err) => console.error(err));
client.connect();
