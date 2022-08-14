import { objectType, extendType, nonNull, stringArg, intArg, inputObjectType, enumType, arg, list } from 'nexus';
import { Prisma } from "@prisma/client";

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.nonNull.dateTime("createdAt");
    t.field('postedBy', {
      type: 'User',
      resolve(parent, args, context) {
        return context.prisma.link
            .findUnique({ where: { id: parent.id } })
            .postedBy();
      },
    });

    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.nonNull.field("feed", {
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
      },

      async resolve(parent, args, context) {
        const { filter } = args;
        const where = filter
          ? {
              OR: [
                { description: { contains: filter } },
                { url: { contains: filter } },
              ],
          } : {};

        const links = await context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined,
        });

        const count = await context.prisma.link.count({ where });
        const id = `main-feed:${JSON.stringify(args)}`;

        return {
          count,
          id,
          links,
        };
      }
    });

    t.nonNull.list.nonNull.field("users", {
      type: "User",
      resolve(parent, args, context, info) {
        return context.prisma.user.findMany();
      }
    })
  },
});

export const LinkMutation = extendType({
  // post(description: String!, url: String!): Link!
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args;
        const { userId } = context;
        console.log('From Link.ts', context.userId, userId)

        if (!userId) {
          throw new Error("Cannot post without logging in.");
        }

        const link = context.prisma.link.create({
          data: {
            description: description,
            url: url,
            postedBy: { connect: { id: userId } }
          },
        });
        return link;
      },
    });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ['asc', 'desc'],
});

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  }
})

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link });
    t.nonNull.int("count");
    t.id("id");
  },
});

export const LinkUpdate = extendType({
  // updateLink(id: ID!, url: String, description: String): Link!
  type: "Mutation",
  definition(t) {
    t.nonNull.field("update", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
        url: nonNull(stringArg()),
        description: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const link = context.prisma.link.update({
          where: {
            id: args.id
          },
          data: {
            description: args.description,
            url: args.url,
          }
        });

        return link;
      }
    })
  }
});

export const LinkDelete = extendType({
  // deleteLink(id: ID!): Link!
  type: "Mutation",
  definition(t) {
    t.nonNull.field("delete", {
      type: "Link",
      args: {
        id: nonNull(intArg())
      },


      resolve(parent, args, context) {
        const link = context.prisma.link.delete({
          where: {
            id: args.id
          },
        });

        return link;
      },
    });
  },
});
