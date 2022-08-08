import { objectType, extendType, nonNull, stringArg, intArg } from 'nexus';
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string("description");
    t.nonNull.string("url");
  }
})

let links: NexusGenObjects["Link"][] = [
  {
    id: 1,
    url: "www.howtogrophql.com",
    description: "Fullstack tutorail for GraphQL",
  },
  {
    id: 2,
    url: "graphiql.org",
    description: "GraphQL official website."
  },
];

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return context.prisma.link.findMany();
      }
    });
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
        const link = context.prisma.link.create({
          data: {
            description: args.description,
            url: args.url,
          },
        });
        return link;
      },
    });
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
